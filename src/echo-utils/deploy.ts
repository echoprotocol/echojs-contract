import { PrivateKey, ContractFrame } from "echojs-lib";
import { Apis } from "echojs-ws";
import Contract from "../Contract";
import { parseInput } from "../simple-utils/parseInput";
import getAccountId from "./getAccountId";
import AbiFunction from "../../@types/abiFunction";
import { GET_DEFAULT_ABI_FUNCTION } from "../index";

export default async function deploy(
	bytecode: Buffer,
	abi: Array<AbiFunction>,
	privateKey: PrivateKey,
	args: Array<any> = [],
): Promise<Contract> {
	const accountId = await getAccountId(privateKey);
	const contractFrame = new ContractFrame();
	const constructorAbi: AbiFunction = abi.find((func: AbiFunction) => func.type === "constructor")
		|| GET_DEFAULT_ABI_FUNCTION();
	const pureArguments: string = constructorAbi.inputs
		.map(({ type }, inputIndex) => parseInput(type, args[inputIndex]))
		.join('');
	const deployCallRes = await contractFrame.deployContract({
		accountId,
		gas: 10e6,
		bytecode: bytecode.toString('hex') + pureArguments,
	}, privateKey);
	const deployResultId: string = deployCallRes[0].trx.operation_results[0][1];
	const deployResult = await Apis.instance().dbApi().exec('get_contract_result', [deployResultId]);
	const contractId = `1.16.${Number.parseInt((deployResult.exec_res.new_address as string).substr(8), 16)}`;
	const contract = new Contract(contractId, abi);
	await contract.setAccount(privateKey);
	return contract;
}
