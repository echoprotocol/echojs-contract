// TODO: see why WebStorm cannot use declaration file of this module
// noinspection ES6CheckImport
import { keccak256 } from 'js-sha3';

/**
 * @param {AbiMethod} abiMethod
 * @returns {string}
 */
export function getSignature(abiMethod) {
	return `${abiMethod.name}(${abiMethod.inputs.map(({ type }) => type).join(',')})`;
}

/**
 * @param {AbiMethod} abiMethod
 * @returns {string}
 */
export function getMethodHash(abiMethod) {
	return keccak256(getSignature(abiMethod)).substr(0, 8)
}
