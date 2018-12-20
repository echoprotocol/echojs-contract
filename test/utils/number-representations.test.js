import { ok } from 'assert';
import BigNumber from 'bignumber.js';
import { expect } from 'chai';
import {
	toDirectRepresentation,
	toOnesComplementRepresentation,
	toTwosComplementRepresentation,
} from '../../src/utils/number-representations';

describe('number representations', () => {
	describe('direct representation', () => {
		it('bits count is gte MAX_SAFE_INTEGER', () => {
			expect(() => {
				toDirectRepresentation(123, Number.MAX_SAFE_INTEGER * 2);
			}).to.throw(Error, 'bits count is not uint53');
		});
		it('overflow', () => {
			expect(() => toDirectRepresentation(new BigNumber(2).pow(8).plus(123), 8)).to.throw(Error, 'int8 overflow');
		});
		it('positive', () => ok(toDirectRepresentation(9, 8).eq(new BigNumber('00001001', 2))));
		it('negative', () => ok(toDirectRepresentation(-9, 8).eq(new BigNumber('10001001', 2))));
		it('value is BigNumber', () => {
			ok(toDirectRepresentation(new BigNumber(13), 8).eq(new BigNumber('00001101', 2)));
		});
	});

	describe('one\'s complement representation', () => {
		it('positive', () => ok(toOnesComplementRepresentation(9, 8).eq(new BigNumber('00001001', 2))));
		it('negative', () => ok(toOnesComplementRepresentation(-9, 8).eq(new BigNumber('11110110', 2))));
		it('value is BigNumber', () => {
			ok(toOnesComplementRepresentation(new BigNumber(13), 8).eq(new BigNumber('00001101', 2)));
		});
	});

	describe('two\'s complement representation', () => {
		it('positive', () => ok(toTwosComplementRepresentation(9, 8).eq(new BigNumber('00001001', 2))));
		it('negative', () => ok(toTwosComplementRepresentation(-9, 8).eq(new BigNumber('11110111', 2))));
		it('value is BigNumber', () => {
			ok(toTwosComplementRepresentation(new BigNumber(13), 8).eq(new BigNumber('00001101', 2)));
		});
	});
});
