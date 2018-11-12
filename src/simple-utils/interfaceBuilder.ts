import $ from "comprehension";
import AbiFunction from "../../@types/abiFunction";
import SolType from "../../@types/sol-type";

const anyNumberTypes = ['uint', 'int']
	.map((type) => $({ from: 8, to: 48, step: 8 }, (bitsCount) => type + bitsCount))
	.reduce((acc, types) => [...acc, ...types], []);

const bigNumberTypes = ['uint', 'int']
	.map((type) => $({ from: 56, to: 256, step: 8 }, (bitsCount) => type + bitsCount))
	.reduce((acc, types) => [...acc, ...types], []);

const bufferTypes = $({ from: 1, to: 32 }, (bytesCount) => `bytes${bytesCount}`);

function getInputType(originalType: string): string {
	if (originalType === 'bool') return 'boolean';
	if (['address', 'string'].includes(originalType)) return 'string';
	if (originalType.substr(originalType.length - 2, 2) === '[]') {
		return `Array<${getInputType(originalType.substr(0, originalType.length - 2))}>`;
	}
	if (anyNumberTypes.includes(originalType)) return 'number | BigNumber';
	if (bigNumberTypes.includes(originalType)) return 'BigNumber';
	if (bufferTypes.includes(originalType)) return 'Buffer | string | { value: Buffer | string, align: \'left\' | \'right\' | \'none\' }';
	throw new Error(`unknown type ${originalType}`);
}

function getOutputType(originalType: SolType): string {
	if (originalType === 'bool') return 'boolean';
	if (['address', 'string'].includes(originalType)) return 'string';
	if (originalType.substr(originalType.length - 2, 2) === '[]') {
		return `Array<${getOutputType(originalType.substr(0, originalType.length - 2) as SolType)}>`;
	}
	const arrMatch = originalType.match(/^(.+)\[[1-9]\d*]$/);
	if (arrMatch) return `Array<${getOutputType(arrMatch[1] as SolType)}>`;
	if (anyNumberTypes.includes(originalType)) return 'number';
	if (bigNumberTypes.includes(originalType)) return 'BigNumber';
	if (bufferTypes.includes(originalType)) return 'Buffer';
	throw new Error(`unknown type ${originalType}`);
}

export default function buildInterface(contractName: string, abi: Array<AbiFunction>): string {
	let result = '';
	result = '\nimport BigNumber from "bignumber.js";\n';
	result += 'import Contract, { AbiFunction } from "echojs-contract";\n';
	result += 'import { PrivateKey } from "echojs-lib";\n';
	result += `\nexport default abstract class ${contractName}Contract extends Contract {\n`;
	result += `\tnew(): ${contractName}Contract;\n`;
	const constructorAbi: AbiFunction | undefined = abi.find(({ type }) => type === 'constructor');
	if (constructorAbi && constructorAbi.inputs.length > 0) {
		result +=
			'\tpublic static deploy(\n' +
			'\t\tbytecode: Buffer,\n' +
			'\t\tabi: Array<AbiFunction>,\n' +
			'\t\tprivateKey: PrivateKey,\n' +
			`\t\targs: [\n\t\t\t${constructorAbi.inputs
				.map(({ type, name }) => `${getInputType(type)}, // ${type}${name ? ` (${name})` : ''}`)
				.join('\n\t\t\t')},\n\t\t],\n` +
			'\t): Promise<Contract>;\n';
	}
	for (let func of abi) {
		const { name, inputs, outputs, type, payable } = func;
		if (type !== 'function') continue;
		const inputsArgs = [
			...inputs.map(({ type, name }) => `${name || '_'}: ${getInputType(type)}`),
			...payable ? ['value: number'] : [],
		].join(', ');
		const outputsArr = (outputs || []).map(({ type }: { type: SolType }) => getOutputType(type));
		const outputArgs = outputsArr.length === 0
			? 'null'
			: (outputsArr.length === 1 ? outputsArr[0] : `[${outputsArr.join(', ')}]`);
		result += `\t${name}(${inputsArgs}): Promise<${outputArgs}>;\n`;
	}
	result += '}\n';
	return result;
}
