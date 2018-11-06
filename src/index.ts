import Contract, { getDefaultAccountId, setDefaultAccount } from './Contract';
import connect from './echo-utils/connect';
import deploy from './echo-utils/deploy';
import getAccountId from './echo-utils/getAccountId';

import AbiFunction from '../@types/abiFunction';

export default Contract;

export {
	connect,
	Contract,
	getDefaultAccountId,
	setDefaultAccount,
	deploy,
	AbiFunction,
	getAccountId,
};

export function GET_DEFAULT_ABI_FUNCTION(): AbiFunction {
	return {
		constant: false,
		inputs: [],
		name: '',
		outputs: [],
		payable: false,
		stateMutability: 'pure',
		type: 'constructor',
	};
}
