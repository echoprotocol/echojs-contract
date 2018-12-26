import { cloneDeep } from 'lodash';
import { getMethodHash, getSignature } from './utils/solidity-utils';
import encode from './encoders';

/**
 * @typedef {Object} Method
 * @property {function():string} getCode
 */

class Contract {

	/** @returns {Array.<AbiMethod>} */
	get abi() {
		return cloneDeep(this._abi);
	}

	/** @param {Array.<AbiMethod>} value */
	set abi(value) {
		if (!Array.isArray(value)) throw new Error('abi is not an array');
		/** @type {Object.<string, function():Method>} */
		const newMethodsMap = {};
		for (const abiFunction of value) {
			if (abiFunction.type !== 'function') continue;
			if (!abiFunction.name) throw new Error('function has no name');
			const signature = getSignature(abiFunction);
			const hash = getMethodHash(abiFunction);
			const method = (...args) => {
				if (args.length !== abiFunction.inputs.length) throw new Error('invalid arguments count');
				const code = hash + encode(args.map((argument, index) => ({
					value: argument,
					type: abiFunction.inputs[index].type,
				})));
				return { getCode: () => code };
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
		 * @type {Array.<AbiMethod>}
		 */
		this._abi = cloneDeep(value);
		/**
		 * @private
		 * @type {Object.<string, function():Method>}
		 */
		this._methods = newMethodsMap;
	}

	/** @returns {Object.<string, function():Method>} */
	get methods() {
		return { ...this._methods };
	}

	/**
	 * @param {Array.<AbiMethod>} abi
	 */
	constructor(abi) {
		this.abi = abi;
	}

}

export default Contract;
