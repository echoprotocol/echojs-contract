import BN from 'bignumber.js';
import comprehension from 'comprehension';

import SolType from '../../@types/sol-type';

export function bool(ouput: string) {
	if (ouput === comprehension(64, () => 0).join('')) return false;
	if (ouput === comprehension(63, () => 0).join('') + '1') return true;
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
	return `1.${isContract ? '16' : '2'}.${new BN(output.substr(26), 16)}`;
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

export default function parseOutput(output: string, type: SolType) {
	if (type === 'bool') return bool(output);
	if (type === 'address') return address(output);
	const bytesNMatch = type.match(/^bytes(\d+)$/);
	if (bytesNMatch) return bytesN(Number.parseInt(bytesNMatch[1], 10), output);
	const uintNMatch = type.match(/^uint(\d+)$/);
	if (uintNMatch) return uintN(Number.parseInt(uintNMatch[1], 10), output);
	throw new Error(`parsing of ${type} is not implemented`);
}
