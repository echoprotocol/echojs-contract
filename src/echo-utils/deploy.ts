import { PrivateKey, ContractFrame } from "echojs-lib";
import { Apis } from "echojs-ws";
import Contract from "../Contract";
import getAccountId from "./getAccountId";
import AbiFunction from "../../@types/abiFunction";

export default async function deploy(
	bytecode: Buffer,
	abi: Array<AbiFunction>,
	privateKey: PrivateKey,
	args?: Array<any>,
): Promise<Contract> {
	const accountId = await getAccountId(privateKey);
	const contractFrame = new ContractFrame();
	const deployCallRes = await contractFrame.deployContract({
		accountId,
		gas: 10e6,
		bytecode: bytecode.toString('hex'),
	}, privateKey);
	const deployResultId: string = deployCallRes[0].trx.operation_results[0][1];
	const deployResult = await Apis.instance().dbApi().exec('get_contract_result', [deployResultId]);
	const contractId = `1.16.${Number.parseInt((deployResult.exec_res.new_address as string).substr(8), 16)}`;
	const contract = new Contract(contractId, abi);
	await contract.setAccount(privateKey);
	return contract;
}
