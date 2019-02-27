import { Echo, PrivateKey, BigNumber, OPERATIONS } from 'echojs-lib';
import { cloneDeep } from 'lodash';

import encode from './encoders';
import Method from './Method';
import { getMethodHash, getSignature, checkAbiFormat } from './utils/solidity-utils';
import { checkContractId } from './utils/validators';

/** @typedef {import("../types/_Abi").Abi} Abi */
/** @typedef {import("echojs-lib/types/echo/transaction").OPERATION_RESULT_VARIANT} OPERATION_RESULT_VARIANT */

class Contract {

	/**
	 * @param {Buffer|string} code
	 * @param {Echo} echo
	 * @param {PrivateKey} privateKey
	 * @param {Object} [options]
	 * @param {Abi} [options.abi]
	 * @param {boolean} [options.ethAccuracy]
	 * @param {string} [options.supportedAssetId]
	 * @param {Object} [options.value]
	 * @param {number|string|BigNumber} [options.value.amount=0]
	 * @param {string} [options.value.assetId]
	 * @returns {Promise<Contract|string>}
	 */
	static async deploy(
		code,
		echo,
		privateKey,
		options,
	) {
		if (Buffer.isBuffer(code)) code = code.toString('hex');
		else if (typeof code !== 'string') throw new Error('invalid code type');
		if (!(echo instanceof Echo)) throw new Error('echo is not instance of Echo class');
		if (!(privateKey instanceof PrivateKey)) throw new Error('private key is not instance of PrivateKey class');
		if (!options) options = {};
		if (options.abi !== undefined) checkAbiFormat(options.abi);
		if (options.ethAccuracy === undefined) options.ethAccuracy = false;
		else if (typeof options.ethAccuracy !== 'boolean') throw new Error('ethAccouracy is not boolean');
		if (options.supportedAssetId !== undefined) {
			if (typeof options.supportedAssetId !== 'string') throw new Error('supportedAssetId invalid id');
			if (/^1\.3\.(0|[1-9]\d*)$/.test(options.supportedAssetId) === false) {
				throw new Error('invalid supportedAssetId format');
			}
		}
		if (!options.value) options.value = {};
		if (options.value.amount === undefined) options.value.amount = 0;
		else {
			if (typeof options.value.amount === 'number') {
				if (options.value.amount < 0) throw new Error('amount is negative');
				if (Number.isSafeInteger(options.value.amount)) throw new Error('amount is not safe integer');
			} else if (BigNumber.isBigNumber(options.value.amount)) {
				options.value.amount = options.value.amount.toString(10);
			} else if (typeof options.value.amount !== 'string') throw new Error('invalid amount type');
			else if (/^(0|[1-9]\d*)$/.test(options.value.amount) === false) {
				throw new Error('amount is not non-negative integer');
			}
		}
		if (!options.value.assetId) options.value.assetId = '1.3.0';
		else if (typeof options.value.assetId !== 'string') throw new Error('assetId is not string');
		else if (/^1\.3\.(0|[1-9]\d*)$/.test(options.value.assetId) === false) {
			throw new Error('invalid assetId format');
		}
		const [[accountId]] = await echo.api.getKeyReferences([privateKey.toPublicKey()]);
		const contractId = await echo.createTransaction().addOperation(OPERATIONS.CREATE_CONTRACT, {
			code,
			eth_accuracy: options.ethAccuracy,
			registrar: accountId,
			supported_asset_id: options.supportedAssetId,
			value: { amount: options.value.amount, asset_id: options.value.assetId },
		}).addSigner(privateKey).broadcast().then(async (res) => {
			/** @type {import("echojs-lib/types/echo/transaction").OPERATION_RESULT<OPERATION_RESULT_VARIANT.OBJECT>} */
			const [, opResId] = res[0].trx.operation_results[0];
			const address = await echo.api.getContractResult(opResId, true).then((res) => res[1].exec_res.new_address);
			return `1.16.${new BigNumber(address.slice(2), 16).toString(10)}`;
		});
		if (options.abi === undefined) return contractId;
		return new Contract(options.abi, { echo, contractId });
	}

	/** @returns {Set<string>} */
	get namesDublications() { return new Set(this._namesDublications); }

	/** @type {Abi} */
	get abi() { return cloneDeep(this._abi); }

	set abi(value) {
		checkAbiFormat(value);
		/** @type {{[nameOrHashOrSignature:string]:()=>Method>}} */
		const newMethodsMap = {};
		/**
		 * @private
		 * @type {Set<string>}
		 */
		this._namesDublications = new Set();
		for (const abiFunction of value) {
			if (abiFunction.type !== 'function') continue;
			const signature = getSignature(abiFunction);
			const hash = getMethodHash(abiFunction);
			const method = (...args) => {
				if (args.length !== abiFunction.inputs.length) throw new Error('invalid arguments count');
				const encodingInput = args.map((argument, index) => ({
					value: argument,
					type: abiFunction.inputs[index].type,
				}));
				const code = hash + encode(encodingInput);
				return new Method(this, abiFunction.outputs, code);
			};
			if (newMethodsMap[abiFunction.name]) {
				this._namesDublications.add(abiFunction.name);
				delete newMethodsMap[abiFunction.name];
			} else if (!this._namesDublications.has(abiFunction.name)) {
				newMethodsMap[abiFunction.name] = method;
			}
			newMethodsMap[signature] = method;
			newMethodsMap[`0x${hash}`] = method;
		}
		if (this._namesDublications.size > 0) {
			// TODO: think about this case
			// eslint-disable-next-line no-console
			console.warn('[WARN] Found several functions with the same name');
			// eslint-disable-next-line no-console
			console.warn('       To call them, use their signatures or hashes');
			// eslint-disable-next-line no-console
			console.warn('       Get a list of duplicate names from a field "namesDublications"');
		}
		/**
		 * @private
		 * @type {Abi}
		 */
		this._abi = cloneDeep(value);
		/**
		 * @private
		 * @type {{[nameOrHashOrSignature:string]:()=>Method}}
		 */
		this._methods = newMethodsMap;
	}

	/** @type {Echo|undefined} */
	get echo() { return this._echo; }

	set echo(value) {
		if (!(value instanceof Echo)) throw new Error('value is not a instance of Echo');
		/** @type Echo */
		this._echo = value;
	}

	/** @type {string|undefined} */
	get address() { return this._address; }

	set address(value) {
		checkContractId(value);
		/** @type {string|undefined} */
		this._address = value;
	}

	/** @returns {{[nameOrHashOrSignature:string]:()=>Method}} */
	get methods() { return { ...this._methods }; }

	/**
	 * @param {Abi} abi
	 * @param {Echo} echo
	 * @param {string} contractId
	 */
	constructor(abi, { echo, contractId } = {}) {
		this.abi = abi;
		if (echo !== undefined) this.echo = echo;
		if (contractId !== undefined) this.address = contractId;
	}

}

export default Contract;
