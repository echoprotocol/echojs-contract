import "mocha";
import { wif } from "config";
import { PrivateKey } from "echojs-lib";
import { readFile } from "fs-extra";
import { AbiFunction, deploy } from "../src";
import PayableContract from "./contracts/interfaces/PayableContract";
import { ok } from "assert";

describe('payable', () => {
	let contract: PayableContract;
	it('deploy', async function () {
		this.timeout(17e3);
		const { Payable: contractData } = await readFile(`${__dirname}/contracts/output.json`)
			.then((res) => JSON.parse(res.toString()));
		const { bytecode, abi }: { bytecode: string, abi: Array<AbiFunction> } = contractData;
		contract = <PayableContract>await deploy(
			Buffer.from(bytecode.substr(2), 'hex'),
			abi,
			PrivateKey.fromWif(wif),
		);
	});
	const value: number = 1e-2;
	it('send', async function () {
		this.timeout(12e3);
		ok(await contract.send({ value }).then((res) =>  res.times(1e-5).eq(value)));
	});
	it('check', async () => ok(await contract.value().then((res) => res.times(1e-5).eq(value))));
});
