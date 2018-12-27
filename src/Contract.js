import { Echo } from 'echojs-lib';
import { cloneDeep } from 'lodash';
import { getMethodHash, getSignature, checkAbiFormat } from './utils/solidity-utils';
import encode from './encoders';
import BigNumber from 'bignumber.js';
import decode from './decoders';

/** @typedef {import("../types/_Abi").AbiMethod} AbiMethod */

const MAX_CONTRACT_ID = new BigNumber(2).pow(152).minus(1);

function checkContractId(contractId) {
	if (!/^1\.16\.[1-9]\d*$/.test(contractId)) throw new Error('invalid contractId format');
	const id = new BigNumber(contractId.split('.')[2]);
	if (id.gt(MAX_CONTRACT_ID)) throw new Error('contractId is greater than or equals to 2**152');
}

/**
 * @typedef {Object} CallOptions
 * @property {string} [contractId]
 * @property {string} [assetId]
 * @property {string} [accountId]
 * @property {Echo} [echo]
 */

/**
 * @typedef {Object} Method
 * @property {()=>string} getCode
 * @property {(options:CallOptions)=>Promise<Array<*>|*|null>} call
 */

class Contract {

	/** @type {Array<AbiMethod>} */
	get abi() { return cloneDeep(this._abi); }

	set abi(value) {
		checkAbiFormat(value);
		/** @type {{[nameOrHashOrSignature:string]:()=>Method>}} */
		const newMethodsMap = {};
		for (const abiFunction of value) {
			if (abiFunction.type !== 'function') continue;
			const signature = getSignature(abiFunction);
			const hash = getMethodHash(abiFunction);
			const method = (...args) => {
				if (args.length !== abiFunction.inputs.length) throw new Error('invalid arguments count');
				const code = hash + encode(args.map((argument, index) => ({
					value: argument,
					type: abiFunction.inputs[index].type,
				})));
				return {
					getCode: () => code,
					call: (options) => this._call(options),
				};
			};
			if (newMethodsMap[abiFunction.name]) {
				// TODO: think about this case
				console.warn(`[WARN]: There r several methods with name ${abiFunction.name}.`);
				console.warn(`        To call them use its signatures or hashes.`);
				delete newMethodsMap[abiFunction.name];
			} else {
				newMethodsMap[abiFunction.name] = method;
			}
			newMethodsMap[signature] = method;
			newMethodsMap[`0x${hash}`] = method;
		}
		/**
		 * @private
		 * @type {Array<AbiMethod>}
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
		if (!value instanceof Echo) throw new Error('value is not a instance of Echo');
		/** @type Echo */
		this._echo = value;
	}

	/** @type {string|undefined} */
	get contractId() { return this._contractId; }

	set contractId(value) {
		checkContractId(value);
		/** @type {string|undefined} */
		this._contractId = value;
	}

	/** @returns {{[nameOrHashOrSignature:string]:()=>Method}} */
	get methods() { return { ...this._methods }; }

	/**
	 * @param {Array<AbiMethod>} abi
	 * @param {Echo} echo
	 * @param {string} contractId
	 */
	constructor(abi, { echo, contractId } = {}) {
		this.abi = abi;
		if (echo !== undefined) this.echo = echo;
		if (contractId !== undefined) this.contractId = contractId;
	}

	/**
	 * @private
	 * @param {AbiMethod} abiMethod
	 * @param {string} code
	 * @param {CallOptions} [options]
	 */
	async _call(abiMethod, code, options = {}) {
		let { contractId, assetId, accountId, echo } = options;
		if (contractId === undefined) {
			if (this.contractId === undefined) throw new Error('no contractId');
			contractId = this.contractId;
		} else checkContractId(contractId);
		if (assetId === undefined) assetId = '1.3.0';
		else if (!/^1\.3\.(0|[1-9]\d*)$/.test(assetId)) throw new Error('invalid assetId format');
		if (accountId === undefined) accountId = '1.2.0';
		else if (!/^1\.2\.(0|[1-9]\d*)$/.test(accountId)) throw new Error('invalid accountId format');
		echo = echo || this.echo;
		if (!echo) throw new Error('no echo instance');
		// FIXME: remove @type when JSDoc of callContractNoChangingState will be fixed
		/** @type {string} */
		const rawResult = await echo.api.callContractNoChangingState(contractId, accountId, assetId, code);
		if (rawResult === '') {
			if (abiMethod.outputs.length === 0) return null;
			throw new Error('call failed');
		}
		return decode(rawResult, abiMethod.outputs.map(({ type }) => type));
	}

}

export default Contract;
