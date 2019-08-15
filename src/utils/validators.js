import BigNumber from 'bignumber.js';
import { constants } from 'echojs-lib';

const MAX_CONTRACT_ID = new BigNumber(2).pow(152).minus(1);
const CONTRACT_TYPE_ID = constants.OBJECT_TYPES.CONTRACT;
const ACCOUNT_TYPE_ID = constants.OBJECT_TYPES.ACCOUNT;

export const contractIdRegExp = new RegExp(`^1\\.${CONTRACT_TYPE_ID}\\.(([1-9]\\d*)|0)$`);
export const addressRegExp = new RegExp(`^1\\.(${CONTRACT_TYPE_ID}|${ACCOUNT_TYPE_ID})\\.(([1-9]\\d*)|0)$`);

export function checkContractId(contractId) {
	if (!contractIdRegExp.test(contractId)) throw new Error('invalid contractId format');
	const id = new BigNumber(contractId.split('.')[2]);
	if (id.gt(MAX_CONTRACT_ID)) throw new Error('contractId is greater than or equals to 2**152');
}
