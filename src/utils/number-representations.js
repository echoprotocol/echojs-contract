import BigNumber from 'bignumber.js';
import { toBigInteger } from './converters';

/** @param {number} bitsCount */
function checkBitsCount(bitsCount) {
	if (!Number.isSafeInteger(bitsCount)) throw new Error('bits count is not a safe integer');
	if (bitsCount <= 0) throw new Error('bits count is not positive');
}

/**
 * @param {number|BigNumber} number
 * @param {number} bitsCount
 * @returns {BigNumber}
 */
export function toDirectRepresentation(number, bitsCount) {
	checkBitsCount(bitsCount);
	number = toBigInteger(number);
	const abs = number.abs();
	if (abs.gte(new BigNumber(2).pow(bitsCount - 1))) throw new Error(`int${bitsCount} overflow`);
	return number.isNegative() ? abs.plus(new BigNumber(2).pow(bitsCount - 1)) : abs;
}

/** @param {BigNumber} representation */
function checkRepresentation(representation) {
	if (!BigNumber.isBigNumber(representation)) throw new Error('representation is not a BigNumber');
}

/**
 * @param {BigNumber} directRepresentation
 * @param {number} bitsCount
 * @returns {BigNumber}
 */
export function fromDirectRepresentation(directRepresentation, bitsCount) {
	checkBitsCount(bitsCount);
	checkRepresentation(directRepresentation);
	if (directRepresentation.gte(new BigNumber(2).pow(bitsCount))) {
		throw new Error(`${bitsCount}-bit representation overloaded`);
	}
	const postMaxValue = new BigNumber(2).pow(bitsCount - 1);
	const isNegative = directRepresentation.gte(postMaxValue);
	const abs = isNegative ? directRepresentation.minus(postMaxValue) : directRepresentation;
	return isNegative ? abs.times(-1) : abs;
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
 * @param {BigNumber} onesComplementRepresentation
 * @param {number} bitsCount
 * @returns {BigNumber}
 */
export function fromOnesComplementRepresentation(onesComplementRepresentation, bitsCount) {
	checkRepresentation(onesComplementRepresentation);
	const isNegative = onesComplementRepresentation.gte(new BigNumber(2).pow(bitsCount - 1));
	return isNegative ?
		fromDirectRepresentation(
			new BigNumber(2)
				.pow(bitsCount - 1)
				.minus(1)
				.plus(new BigNumber(2).pow(bitsCount))
				.minus(onesComplementRepresentation),
			bitsCount,
		) :
		fromDirectRepresentation(onesComplementRepresentation, bitsCount);
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

/**
 * @param twosComplementRepresentation
 * @param bitsCount
 * @returns {BigNumber}
 */
export function fromTwosComplementRepresentation(twosComplementRepresentation, bitsCount) {
	checkRepresentation(twosComplementRepresentation);
	const isNegative = twosComplementRepresentation.gte(new BigNumber(2).pow(bitsCount - 1));
	return fromOnesComplementRepresentation(
		isNegative ? twosComplementRepresentation.minus(1) : twosComplementRepresentation,
		bitsCount,
	);
}
