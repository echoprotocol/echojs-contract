import comprehension from 'comprehension';
import { TransactionBuilder, PrivateKey, Apis } from 'echojs-lib';
import { keccak256 } from 'js-sha3';
import parseInputs, { parseInput } from '../simple-utils/parseInput';
import { parseOutput } from '../simple-utils/parseOutput';
import AbiFunction from '../types/abiFunction';
import BigNumber from 'bignumber.js';

function getFunctionCode(abiFunction: AbiFunction) {
	return keccak256(`${abiFunction.name}(${abiFunction.inputs.map(({ type }) => type).join(',')})`).substr(0, 8);
}

function parseResult(callResult: string, abiFunction: AbiFunction): any {
	const splittedRes = comprehension(callResult.length / 64, (index) => callResult.substr(index * 64, 64));
	const result = (abiFunction.outputs || []).map(({ type }, index) => parseOutput(splittedRes[index], type));
	if (result.length === 0) return null;
	if (result.length === 1) return result[0];
	return result;
}

export async function call(
	contractId: string,
	accountId: string,
	privateKey: PrivateKey,
	abiFunction: AbiFunction,
	args: Array<any>,
	value: number | BigNumber = 0,
): Promise<any> {
	if (abiFunction.type !== 'function') throw new Error('is not a function');
	const functionCode = getFunctionCode(abiFunction);
	const pureArgs = parseInputs(abiFunction.inputs.map(({ type }, inputIndex) => ({ type, arg: args[inputIndex] })));
	const transaction = new TransactionBuilder();
	transaction.add_type_operation('call_contract', {
		registrar: accountId,
		value: { amount: new BigNumber(value).times(1e4).toString(), asset_id: '1.3.0' },
		gasPrice: 0,
		gas: 10e6,
		code: functionCode + pureArgs,
		callee: contractId,
	});
	await transaction.set_required_fees('1.3.0');
	transaction.add_signer(privateKey);
	const transactionResultId = await transaction.broadcast().then((res) => res[0].trx.operation_results[0][1]);
	const callResult = await Apis.instance().dbApi().exec('get_contract_result', [transactionResultId])
		.then((res) => res[1].exec_res.output);
	if (callResult === undefined && abiFunction.outputs!.length > 0) throw new Error('Transaction failed');
	return parseResult(callResult as string, abiFunction);
}

export async function view(contractId: string, accountId: string | null, abiFunction: AbiFunction, args: Array<any>) {
	if (abiFunction.type !== 'function') throw new Error('is not a function');
	const functionCode = getFunctionCode(abiFunction);
	const pureArgs = parseInputs(abiFunction.inputs.map(({ type }, inputIndex) => ({ type, arg: args[inputIndex] })));
	const viewResult = await Apis.instance().dbApi().exec(
		'call_contract_no_changing_state',
		[contractId, accountId || '1.2.1', '1.3.0', functionCode + pureArgs],
	);
	return parseResult(viewResult, abiFunction);
}
