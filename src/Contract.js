import { Echo } from 'echojs-lib';
import { cloneDeep } from 'lodash';

import encode from './encoders';
import Method from './Method';
import { getMethodHash, getSignature, checkAbiFormat } from './utils/solidity-utils';
import { checkContractId } from './utils/validators';

/** @typedef {import("../types/_Abi").AbiMethod} AbiMethod */

class Contract {

	/** @returns {Set<string>} */
	get namesDublications() { return new Set(this._namesDublications); }

	/** @type {Array<AbiMethod>} */
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
			console.warn('[WARN] Found several functions with the same name');
			console.warn('       To call them, use their signatures or hashes');
			console.warn('       Get a list of duplicate names from a field "namesDublications"');
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
	get address() { return this._address; }

	set address(value) {
		checkContractId(value);
		/** @type {string|undefined} */
		this._address = value;
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
		if (contractId !== undefined) this.address = contractId;
	}

}

export default Contract;
