import { Echo } from 'echojs-lib';
import { cloneDeep } from 'lodash';

import encode from './encoders';
import Method from './Method';
import { getMethodHash, getSignature, checkAbiFormat } from './utils/solidity-utils';

/** @typedef {import("../types/_Abi").AbiMethod} AbiMethod */

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
				return new Method(this, abiFunction.outputs, code);
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

}

export default Contract;
