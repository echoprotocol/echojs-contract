import Contract, { getDefaultAccountId, setDefaultAccount, getDefaultPrivateKey } from './Contract';
import connect from './echo-utils/connect';
import deploy from './echo-utils/deploy';
import getAccountId from './echo-utils/getAccountId';
import getCurrentBlockNumber from './echo-utils/getCurrentBlockNumber';
import buildInterface from './simple-utils/interfaceBuilder';
import parseOutputs from './simple-utils/parseOutput';

import AbiFunction, { Arg } from './types/abiFunction';

export default Contract;

export {
	connect,
	Contract,
	getDefaultAccountId,
	getDefaultPrivateKey,
	setDefaultAccount,
	deploy,
	AbiFunction,
	Arg,
	getAccountId,
	buildInterface,
	parseOutputs,
	getCurrentBlockNumber,
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
