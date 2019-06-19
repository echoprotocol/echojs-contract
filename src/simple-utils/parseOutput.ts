import BN from 'bignumber.js';
import $c from 'comprehension';

import SolType from '../types/sol-type';
import { Arg } from '../';
import { ContractId, AccountId } from '../ObjectId';

export function bool(ouput: string) {
	if (ouput === $c(64, () => 0).join('')) return false;
	if (ouput === $c(63, () => 0).join('') + '1') return true;
	throw {
		message: 'Can not parse bool ouput',
		ouput,
	};
}

export function address(output: string) {
	if (!/^0{25}(0|1)[a-f\d]{38}$/.test(output)) {
		throw {
			message: 'invalid address output format',
			output,
		};
	}
	const isContract = output[25] === '1';
	const index = Number.parseInt(output.substr(26), 16);
	return isContract ? new ContractId(index) : new AccountId(index);
}

export function bytesN(bytesCount: number, output: string): Buffer {
	if (!Number.isSafeInteger(bytesCount) || bytesCount <= 0 || bytesCount > 32) {
		throw new Error(`invalid type bytes${bytesCount}`);
	}
	const charsCount = bytesCount * 2;
	return Buffer.from(output.substr(0, charsCount), 'hex');
}

export function uintN(bitsCount: number, output: string): number | BN {
	if (!Number.isSafeInteger(bitsCount) || bitsCount <= 0 || bitsCount > 256 || bitsCount % 8 !== 0) {
		throw new Error(`invalid type uint${bitsCount}`);
	}
	const preRes: BN = new BN(output, 16);
	if (preRes.gte(new BN(2).pow(bitsCount))) throw new Error(`uint${bitsCount} overloaded`);
	if (bitsCount < 50) return preRes.toNumber();
	return preRes;
}

export function intN(bitsCount: number, output: string): number | BN {
	if (!Number.isSafeInteger(bitsCount) || bitsCount <= 0 || bitsCount > 256 || bitsCount % 8 !== 0) {
		throw new Error(`invalid type int${bitsCount}`);
	}
	const isNegative = Number.parseInt(output[0], 16) >= 8;
	if (!isNegative) return uintN(bitsCount, output);
	const outputAsBuffer = Buffer.from(output, 'hex');
	const invertedBuffer = Buffer.from(Array.from(outputAsBuffer).map((byte) => 255 - byte));
	const preRes: BN = new BN(invertedBuffer.toString('hex'), 16).plus(1);
	if (preRes.gte(new BN(2).pow(bitsCount - 1))) throw new Error(`int${bitsCount} overloaded`);
	if (bitsCount < 50) return -preRes.toNumber();
	return preRes.times(-1);
}

export function parseOutput(output: string, type: SolType) {
	if (type === 'bool') return bool(output);
	if (type === 'address') return address(output);
	const bytesNMatch = type.match(/^bytes(\d+)$/);
	if (bytesNMatch) return bytesN(Number.parseInt(bytesNMatch[1], 10), output);
	const uintNMatch = type.match(/^uint(\d+)$/);
	if (uintNMatch) return uintN(Number.parseInt(uintNMatch[1], 10), output);
	const intNMatch = type.match(/^int(\d+)$/);
	if (intNMatch) return intN(Number.parseInt(intNMatch[1], 10), output);
	throw new Error(`parsing of ${type} is not implemented`);
}

export default function parseOutputs(pureOutput: Buffer, args: Array<Arg>): Array<any> {
	if (pureOutput.length % 32 !== 0) throw new Error('pureOutput length should be divided by 32 bytes');
	const splittedOutput = $c<Buffer>(
		{ count: pureOutput.length / 32, step: 32 },
		(i) => pureOutput.subarray(i, i + 32) as Buffer,
	);
	const result = [];
	for (let i of $c<number>(args.length)) {
		const { type } = args[i];
		const arrayMatch = type.match(/^(.+)\[]$/);
		if (arrayMatch) {
			const subType = arrayMatch[1];
			const offset = Number.parseInt(splittedOutput[i].toString('hex'), 16);
			const length = Number.parseInt(splittedOutput[offset / 32].toString('hex'), 16);
			result.push($c(
				{ from: offset / 32 + 1, count: length },
				(index) => parseOutputs(splittedOutput[index], [{ type: subType as SolType, name: '' }])[0],
			));
			continue;
		}
		if (type === 'string') {
			const offset = Number.parseInt(splittedOutput[i].toString('hex'), 16);
			const length = Number.parseInt(splittedOutput[offset / 32].toString('hex'), 16);
			const chanksCount = Math.ceil(length / 32);
			let string = '';
			const simpleOffset = offset / 32;
			for (let i of $c<number>(chanksCount)) {
				string += (parseOutputs(
					splittedOutput[simpleOffset + i + 1],
					[{ type: 'bytes32', name: '' }],
				)[0] as Buffer).toString();
			}
			result.push(string.substr(0, length));
			continue;
		}
		result.push(parseOutput(splittedOutput[i].toString('hex'), type));
	}
	return result;
}
