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
