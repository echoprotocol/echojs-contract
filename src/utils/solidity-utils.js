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

export function checkIntegerSize(bitsCount) {
	if (typeof bitsCount !== 'number') throw new Error('bits count is not a number');
	if (bitsCount <= 0) throw new Error('bits count is not positive');
	if (bitsCount > 256) throw new Error('bits count is greater than 256');
	if (!Number.isSafeInteger(bitsCount)) throw new Error('bits count is not a integer');
	if (bitsCount % 8 !== 0) throw new Error('bits count is not divisible to 8');
}

export function checkBytesCount(bytesCount) {
	if (typeof bytesCount !== 'number') throw new Error('bytes count is not a number');
	if (bytesCount <= 0) throw new Error('bytes count is not positive');
	if (!Number.isSafeInteger(bytesCount)) throw new Error('bytes count is not a integer');
	if (bytesCount > 32) throw new Error('bytes count is grater than 32');
}

/**
 * @param {AbiMethod} abiMethod
 * @returns {string}
 */
export function getMethodHash(abiMethod) {
	return keccak256(getSignature(abiMethod)).substr(0, 8)
}
