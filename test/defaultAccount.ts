import "mocha";
import { strictEqual, fail } from "assert";
import { wif } from "config";
import { PrivateKey } from "echojs-lib";
import { readFile } from "fs-extra";

import UInt8Contract from "./contracts/interfaces/UInt8Contract";
import { deploy, AbiFunction, getDefaultPrivateKey } from "../src";
import { setDefaultAccount } from "../src";

describe('default account', () => {
	describe('disabled', () => {
		it('getDefaultPrivateKey', () => strictEqual(getDefaultPrivateKey(), null));
		it('deploy', async () => {
			const { UInt8: contractData } = await readFile(`${__dirname}/contracts/output.json`)
				.then((res) => JSON.parse(res.toString()));
			const { bytecode, abi }: { bytecode: string, abi: Array<AbiFunction> } = contractData;
			try {
				await deploy(Buffer.from(bytecode.substr(2), 'hex'), abi);
			} catch (error) {
				strictEqual((error as Error).message, 'Private key is not provided');
				return;
			}
			fail();
		});
	});
	describe('enabled', () => {
		before(() => setDefaultAccount(PrivateKey.fromWif(wif)));
		// TODO: remove this ignore when PrivateKey#toWif will be added to interface
		// @ts-ignore
		it('getDefaultPrivateKey', () => strictEqual(getDefaultPrivateKey().toWif(), wif));
		it('deploy', async function () {
			this.timeout(17e3);
			const { UInt8: contractData } = await readFile(`${__dirname}/contracts/output.json`)
				.then((res) => JSON.parse(res.toString()));
			const { bytecode, abi }: { bytecode: string, abi: Array<AbiFunction> } = contractData;
			const contract = <UInt8Contract>await deploy(Buffer.from(bytecode.substr(2), 'hex'), abi);
			const rnd = Math.floor(Math.random() * 255);
			strictEqual(await contract.set(rnd), rnd);
			strictEqual(await contract.value(), rnd);
		});
	});
});
