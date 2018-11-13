import BN from 'bignumber.js';
import $ from 'comprehension';
import SolType from '../../typing/sol-type';

export function address(input: string): string {
	const sourceAddress = input || '1.2.0';
	if (!/^1\.(2|16)\.(([1-9]\d*)|0)$/.test(sourceAddress)) throw new Error('invalid address format');
	const preRes = new BN(sourceAddress.split('.')[2]).toString(16);
	if (preRes.length > 38) throw new Error('invalid address id');
	const isContract = sourceAddress.split('.')[1] === '16';
	return [
		$(25, () => 0).join(''),
		isContract ? '1' : '0',
		$(38 - preRes.length, () => 0).join(''),
		preRes,
	].join('');
}

type Align = 'none' | 'left' | 'right';

export function bytesN(bytesCount: number, input?: string | Buffer | { value: string | Buffer, align: Align }): string {
	if (bytesCount <= 0) throw new Error('bytes count is not positive');
	if (!Number.isSafeInteger(bytesCount)) throw new Error('bytes count is not a integer');
	const align: Align = (input as { value: string | Buffer, align: Align }).align || 'none';
	input = (input as { value: string | Buffer, align: Align }).value || input;
	if (!input) return $(bytesCount, () => 0).join('');
	if (typeof input === 'string') {
		if (/^0x([a-f\d]{2}){1,32}$/.test(input)) input = Buffer.from(input.substr(2), 'hex');
		else input = Buffer.from(input);
	}
	input = input as Buffer;
	if (input.length !== bytesCount) {
		if (input.length > bytesCount) throw new Error('buffer is too large');
		const arr = Array.from(input);
		if (align === 'none') throw new Error('buffer is too short');
		if (align === 'left') input = Buffer.from([...arr, ...$(bytesCount - arr.length, () => 0)]);
		else if (align === 'right') input = Buffer.from([...$(bytesCount - arr.length, () => 0), ...arr]);
		else throw new Error(`unknown align ${align}`);
	}
	return input.toString('hex') + $(32 - input.length, () => '00').join('');
}

export function uintN(bitsCount: number = 256, input: number | BN = 0): string {
	if (bitsCount <= 0) throw new Error('bits count is not positive');
	if (bitsCount > 256) throw new Error('bits count is greater than 256');
	if (bitsCount % 8 !== 0) throw new Error('bits count is not divisible by 8');
	if (typeof input === 'number') {
		if (input > Number.MAX_SAFE_INTEGER) throw new Error('loss of accuracy, use BigNumber.js');
		input = new BN(input);
	}
	input = input as BN;
	if (input.isNegative()) throw new Error('input is negative');
	if (!input.isInteger()) throw new Error('input is not integer');
	if (input.gte(new BN(2).pow(bitsCount))) throw new Error('is greater than max value');
	const preRes = input.toString(16);
	return $(64 - preRes.length, () => 0).join('') + preRes;
}

export function parseInput(type: SolType, input: any): string {
	if (type === 'address') return address(input);
	if (/^bytes\d+$/.test(type)) {
		const bytesCount = Number.parseInt(type.substr(5), 10);
		return bytesN(bytesCount, input);
	}
	if (/^uint\d+$/.test(type)) {
		const bitsCount = Number.parseInt(type.substr(4), 10);
		return uintN(bitsCount, input);
	}
	throw new Error(`input type ${type} not implemented`);
}

export default function parseInputs(inputs: Array<{ type: SolType, arg: any }>): string {
	const post: Array<{ offsetIndex: number, args: string }> = [];
	const result: Array<string> = [];
	for (let { type, arg } of inputs) {
		const dynamicArrMatch = type.match(/^(.*)\[]$/);
		if (dynamicArrMatch) {
			if (!Array.isArray(arg)) arg = [arg];
			const arr = arg as Array<any>;
			post.push({
				offsetIndex: result.length,
				args: parseInputs([{ type: 'uint256', arg: arr.length }, ...arr.map((element) =>
					({ type: dynamicArrMatch[1] as SolType, arg: element }))]),
			});
			result.push(''.padEnd(64, '0'));
			continue;
		}
		if (type === 'string') {
			if (typeof arg !== 'string') throw new Error('string expected');
			const bytes = Array.from(Buffer.from(arg));
			const arr = $({ to: bytes.length, step: 32 }, (i) => bytes.slice(i, i + 32));
			if (arr[arr.length - 1].length < 32) {
				arr[arr.length - 1] = [...arr[arr.length - 1], ...$(32 - arr[arr.length - 1].length, () => 0)];
			}
			post.push({
				offsetIndex: result.length,
				args: parseInputs([{ type: 'uint256', arg: bytes.length }, ...arr.map((element) =>
					({ type: 'bytes32' as SolType, arg: Buffer.from(element) }))]),
			});
			result.push(''.padEnd(64, '0'));
			continue;
		}
		result.push(parseInput(type, arg));
	}
	for (let { offsetIndex, args } of post) {
		result[offsetIndex] = parseInput('uint256', result.length * 32);
		result.push(...$({ count: args.length / 64, step: 64 }, (i) => args.substr(i, 64)));
	}
	return result.join('');
}
