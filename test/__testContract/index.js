import { spawn } from 'child_process';
import { ok, strictEqual } from 'assert';
import { readFile } from 'fs-extra';

/** @typedef {{ code: Buffer, abi: import("../../types/_Abi").Abi }} ContractInfo */

/** @type {ContractInfo} */
let contractInfo = null;

/** @returns {Promise<string>} */
async function getSolcVersion() {
	const process = spawn('solc', ['--version']);
	/** @type {string} */
	return await new Promise((resolve) => {
		/** @type {string} */
		let result = null;
		process.stdout.on('data', (/** @type {Buffer} */ data) => {
			const versionMatch = data.toString().match(/Version: (\d*\.\d*\.\d*)(\+|-)/);
			ok(versionMatch, 'solc not installed');
			result = versionMatch[1];
		});
		process.on('close', () => resolve(result));
	});
}

async function checkSolcVersion() {
	const solcVersion = await getSolcVersion();
	const [major, minor, patch] = solcVersion.match(/^(\d*)\.(\d*).(\d*)$/)
		.slice(1, 4)
		.map((str) => Number.parseInt(str, 10));
	strictEqual(major, 0, 'invalid solc major version');
	strictEqual(minor, 4, 'invalid solc minor version');
	ok(patch >= 22, 'invalid solc patch version');
}

async function compileContract() {
	await checkSolcVersion();
	const compiler = spawn(
		'solc',
		['--bin', '--abi', '-o', __dirname, `${__dirname}/TestContract.sol`],
	);
	await new Promise((resolve) => compiler.on('close', () => resolve()));
}

/**
 * @returns {Promise<contractInfo>}
 */
async function getContract() {
	if (contractInfo === null) {
		const [abiText, bytecodeHex] = await Promise.all(['abi', 'bin'].map(async (ext) => {
			return await readFile(`${__dirname}/TestContract.${ext}`, 'utf8');
		}));
		const abi = JSON.parse(abiText);
		const code = Buffer.from(bytecodeHex, 'hex');
		contractInfo = { abi, code };
	}
	return contractInfo;
}

export { compileContract, getContract };
