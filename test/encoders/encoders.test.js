import 'mocha';
import { strictEqual, throws } from 'assert';
import { encodeInteger, encodeUnsignedInteger, encodeStaticBytes } from '../../src/encoders';

describe('encoders', () => {
	require('./default-encoder.test');

	describe('encodeIntegers', () => {
		for (const { test, bitsCount } of [
			{ test: 'bits count is not a number', bitsCount: 'not_a_number' },
			{ test: 'bits count is not a integer', bitsCount: 1.23 },
		]) it(test, () => {
			throws(() => encodeInteger(bitsCount, 123), { message: test });
			throws(() => encodeUnsignedInteger(bitsCount, 123), { message: test });
		})
	});

	describe('encodeStaticBytes', () => {
		for (const { test, bytesCount } of [
			{ test: 'bytes count is not a number', bytesCount: 'not_a_number' },
			{ test: 'bytes count is not a integer', bytesCount: 1.23 },
		]) it(test, () => throws(() => encodeStaticBytes(bytesCount, 'qwe'), { message: test }));
		it('align left', () => strictEqual(
			encodeStaticBytes(2, { value: 'af', align: 'left' }),
			'000000000000000000000000000000000000000000000000000000000000af00',
		));
		it('align right', () => strictEqual(
			encodeStaticBytes(2, { value: 'af', align: 'right' }),
			'00000000000000000000000000000000000000000000000000000000000000af',
		));
	});
});
