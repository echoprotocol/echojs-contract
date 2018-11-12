import "mocha";
import { wif } from "config";
import { readFile } from "fs-extra";

import StringTestContract from "./contracts/interfaces/StringTestContract";
import { deploy, AbiFunction } from "../src";
import { PrivateKey } from "echojs-lib";
import $ from "comprehension";
import { strictEqual, ok } from "assert";

describe("string", () => {

	let contract: StringTestContract;
	const testString = $(52, () => String.fromCharCode(Math.floor(Math.random() * (0x7e - 0x21 + 1)) + 0x21)).join('');

	it('deploy', async function () {
		this.timeout(17e3);
		const { StringTest: contractData } = await readFile(`${__dirname}/contracts/output.json`)
			.then((res) => JSON.parse(res.toString()));
		const { bytecode, abi }: { bytecode: string, abi: Array<AbiFunction> } = contractData;
		contract = <StringTestContract>await deploy(
			Buffer.from(bytecode.substr(2), 'hex'),
			abi,
			PrivateKey.fromWif(wif),
		);
	});

	it("send string", async function () {
		this.timeout(12e3);
		strictEqual(await contract.setString(testString), null);
	});

	it("get length", async () => ok(await contract.stringLength().then((res) => res.eq(testString.length))));

});
