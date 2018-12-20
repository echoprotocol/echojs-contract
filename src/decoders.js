import BigNumber from 'bignumber.js';
import $c from 'comprehension';
import { checkIntegerSize } from './utils/solidity-utils';
import { fromTwosComplementRepresentation } from './utils/number-representations';

export function decodeBool(value) {
	if (value === $c(64, () => '0').join('')) return false;
	if (value === $c(63, () => '0').join('') + '1') return true;
	throw new Error(`unable to decode bool`);
}

export function decodeUnsignedInteger(bitsCount, value) {
	checkIntegerSize(bitsCount);
	const result = new BigNumber(value, 16);
	if (!result.isFinite()) throw new Error(`unable to decode uint${bitsCount}`);
	if (result.gte(new BigNumber(2).pow(bitsCount))) throw new Error(`uint${bitsCount} overflow`);
	return bitsCount > 48 ? result : result.toNumber();
}

export function decodeSignedInteger(bitsCount, value) {
	checkIntegerSize(bitsCount);
	const twosComplementRepresentation = new BigNumber(value, 16);
	if (!twosComplementRepresentation.isFinite()) throw new Error(`unable to decode int${bitsCount}`);
	if (twosComplementRepresentation.gte(new BigNumber(2).pow(bitsCount))) {
		throw new Error(`int${bitsCount} overflow`);
	}
	const result = fromTwosComplementRepresentation(twosComplementRepresentation, bitsCount);
	return bitsCount > 48 ? result : result.toNumber();
}
