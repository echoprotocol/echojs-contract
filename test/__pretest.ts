import { readFile, writeFile, mkdirp, readdir } from "fs-extra";
import { compile } from "solc";
import { inspect } from "util";

import { buildInterface } from "../src";

async function compileAllContracts(): Promise<void> {
	const contractsDirs = await readdir(`${__dirname}/contracts/sources`);
	const outputJSON: { [contractName: string]: { bytecode: string, abi: string } } = {};
	const interfaces: { [contractName: string]: string } = {};
	await Promise.all(contractsDirs.map(async (contractFilename) => {
		const contractName = contractFilename.split('.').slice(0, contractFilename.split('.').length - 1).join('.');
		const contractSource = await readFile(`${__dirname}/contracts/sources/${contractFilename}`)
			.then((res) => res.toString());
		const { bytecode, interface: pureAbi } = compile(contractSource, 1).contracts[`:${contractName}`];
		const abi = JSON.parse(pureAbi);
		outputJSON[contractName] = { bytecode: `0x${bytecode}`, abi };
		interfaces[contractName] = buildInterface(contractName, abi);
		await mkdirp(`${__dirname}/contracts/interfaces`);
		await writeFile(
			`${__dirname}/contracts/interfaces/${contractName}Contract.d.ts`,
			interfaces[contractName].replace(
				'import Contract, { AbiFunction } from "echojs-contract";',
				'import Contract, { AbiFunction } from "../../../src";',
			),
		);
	}));
	await writeFile(`${__dirname}/contracts/output.json`, `${JSON.stringify(outputJSON, null, "\t")}\n`);
}

compileAllContracts().then(() => process.exit(0)).catch((error) => {
	console.error('Compiling failed with error:', error instanceof Error ? error : inspect(error, false, null, true));
	process.exit(1);
});
