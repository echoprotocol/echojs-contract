import BigNumber from 'bignumber.js';
import { toBigInteger } from './converters';

/**
 * @param {number|BigNumber} number
 * @param {number} bitsCount
 * @returns {BigNumber}
 */
export function toDirectRepresentation(number, bitsCount) {
	if (!Number.isSafeInteger(bitsCount)) throw new Error('bits count is not a safe integer');
	if (bitsCount <= 0) throw new Error('bits count is not positive');
	number = toBigInteger(number);
	const abs = number.abs();
	if (abs.gte(new BigNumber(2).pow(bitsCount - 1))) throw new Error(`int${bitsCount} overflow`);
	return number.isNegative() ? abs.plus(new BigNumber(2).pow(bitsCount - 1)) : abs;
}

/**
 * @param {number|BigNumber} number
 * @param {number} bitsCount
 * @returns {BigNumber}
 */
export function toOnesComplementRepresentation(number, bitsCount) {
	number = toBigInteger(number);
	const directRepresentation = toDirectRepresentation(number, bitsCount);
	if (!number.isNegative()) return directRepresentation;
	return new BigNumber(2).pow(bitsCount - 1)
		.minus(1)
		.plus(new BigNumber(2).pow(bitsCount))
		.minus(directRepresentation);
}

/**
 * @param {number|BigNumber} number
 * @param {number} bitsCount
 * @returns {BigNumber}
 */
export function toTwosComplementRepresentation(number, bitsCount) {
	number = toBigInteger(number);
	const onesComplementRepresentation = toOnesComplementRepresentation(number, bitsCount);
	if (!number.isNegative()) return onesComplementRepresentation;
	return onesComplementRepresentation.plus(1);
}
