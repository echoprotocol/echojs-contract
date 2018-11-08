import { wif } from "config";
import { readFile } from "fs-extra";

import DynamicArrayContract from "./contracts/interfaces/DynamicArrayContract";
import { deploy, AbiFunction } from "../src";
import { PrivateKey } from "echojs-lib";
import $ from "comprehension";
import { strictEqual, ok } from "assert";
import BN from "bignumber.js";

describe("dynamic array", () => {

	const arrayLength = Math.floor(Math.random() * 5) + 3;
	const testArray = $(arrayLength, () => Math.floor(Math.random() * 2 ** 31) + 1);
	let contract: DynamicArrayContract;

	it('deploy', async function () {
		this.timeout(17e3);
		const { DynamicArray: contractData } = await readFile(`${__dirname}/contracts/output.json`)
			.then((res) => JSON.parse(res.toString()));
		const { bytecode, abi }: { bytecode: string, abi: Array<AbiFunction> } = contractData;
		contract = <DynamicArrayContract>await deploy(
			Buffer.from(bytecode.substr(2), 'hex'),
			abi,
			PrivateKey.fromWif(wif),
		);
	});

	it("send array", async function () {
		this.timeout(12e3);
		strictEqual(await contract.setArray(testArray), null);
	});

	it("get length", async () => ok(await contract.getLength().then((res) => res.eq(arrayLength))));

	it("get element by index", async () => strictEqual(await contract.getByIndex(new BN(1)), testArray[1]));

});
