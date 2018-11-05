import Contract from './Contract';
import connect from './echo-utils/connect';
import deploy from './echo-utils/deploy';
import getAccountId from './echo-utils/getAccountId';

import AbiFunction from '../@types/abiFunction';

export default Contract;

export {
	connect,
	Contract,
	deploy,
	AbiFunction,
	getAccountId,
};
