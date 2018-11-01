import BN from 'bignumber.js';
import comprehension from 'comprehension';
import SolType from '../../@types/sol-type';

export function address(input: string): string {
	const sourceAddress = input || '1.2.0';
	if (!/^1\.(2|16)\.[1-9]\d*$/.test(sourceAddress)) throw new Error('invalid address format');
	const preRes = new BN(sourceAddress.split('.')[2]).toString(16);
	if (preRes.length > 38) throw new Error('invalid address id');
	const isContract = sourceAddress.split('.')[1] === '16';
	return [
		comprehension(25, () => 0).join(''),
		isContract ? '1' : '0',
		comprehension(38 - preRes.length, () => 0).join(''),
		preRes,
	].join('');
}

type Align = 'none' | 'left' | 'right';

export function bytesN(bytesCount: number, input?: string | Buffer, align: Align = 'none'): string {
	if (bytesCount <= 0) throw new Error('bytes count is not positive');
	if (!Number.isSafeInteger(bytesCount)) throw new Error('bytes count is not a integer');
	if (!input) return comprehension(bytesCount, () => 0).join('');
	if (typeof input === 'string') {
		if (/^0x([a-f\d]{2}){1,32}$/.test(input)) input = Buffer.from(input.substr(2), 'hex');
		else input = Buffer.from(input);
	}
	input = input as Buffer;
	if (input.length !== bytesCount) {
		if (input.length > bytesCount) throw new Error('buffer is too large');
		const arr = Array.from(input);
		if (align === 'none') throw new Error('buffer is too short');
		if (align === 'left') input = Buffer.from([...arr, ...comprehension(bytesCount - arr.length, () => 0)]);
		else input = Buffer.from([...comprehension(bytesCount - arr.length, () => 0), ...arr]);
	}
	return input.toString('hex');
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
	return comprehension(bitsCount / 8 - preRes.length, () => 0).join('') + preRes;
}

export default function parseInput(type: SolType, input: any, align: Align = 'none') {
	if (type === 'address') return address(input);
	if (/^bytes\d+$/.test(type)) {
		const bytesCount = Number.parseInt(type.substr(5), 10);
		return bytesN(bytesCount, input, align);
	}
	if (/^uint\d+$/.test(type)) {
		const bitsCount = Number.parseInt(type.substr(4), 10);
		return uintN(bitsCount, input);
	}
	throw new Error(`input type ${type} not implemented`);
}
