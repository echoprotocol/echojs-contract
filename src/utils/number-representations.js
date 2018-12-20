import BigNumber from 'bignumber.js';

/**
 * @param {number|BigNumber} number
 * @param {number} bitsCount
 * @returns {BigNumber}
 */
export function toDirectRepresentation(number, bitsCount) {
	if (bitsCount < 0 || !Number.isSafeInteger(bitsCount)) throw new Error('bits count is not uint53');
	if (typeof number === 'number') number = new BigNumber(number);
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
	if (typeof number === 'number') number = new BigNumber(number);
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
	if (typeof number === 'number') number = new BigNumber(number);
	const onesComplementRepresentation = toOnesComplementRepresentation(number, bitsCount);
	if (!number.isNegative()) return onesComplementRepresentation;
	return onesComplementRepresentation.plus(1);
}
