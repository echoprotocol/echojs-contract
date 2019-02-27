import BigNumber from 'bignumber.js';

const invalidContractIds = ['.2.0', '116.123', '1.16123', '1.16.', '1.16.0123'];

const checkContractIdTests = [
	...invalidContractIds.map((invalidContractId) => ({ test: invalidContractId, error: 'invalid contractId format' })),
	{
		test: 'eq 2**152',
		value: `1.16.${new BigNumber(2).pow(152).toString(10)}`,
		error: 'contractId is greater than or equals to 2**152',
	},
	{
		test: 'gt 2**152',
		value: `1.16.${new BigNumber('1e46').toString(10)}`,
		error: 'contractId is greater than or equals to 2**152',
	},
];

export default checkContractIdTests;
