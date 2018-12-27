import BigNumber from 'bignumber.js';

const MAX_CONTRACT_ID = new BigNumber(2).pow(152).minus(1);

export function checkContractId(contractId) {
	if (!/^1\.16\.[1-9]\d*$/.test(contractId)) throw new Error('invalid contractId format');
	const id = new BigNumber(contractId.split('.')[2]);
	if (id.gt(MAX_CONTRACT_ID)) throw new Error('contractId is greater than or equals to 2**152');
}
