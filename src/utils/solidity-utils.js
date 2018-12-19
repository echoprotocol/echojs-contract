/**
 * @param {AbiMethod} abiMethod
 * @returns {string}
 */
export function getSignature(abiMethod) {
	return `${abiMethod.name}(${abiMethod.inputs.map(({ type }) => type).join(',')})`;
}
