import "mocha";
import { parseInputs } from "../src";
import { strictEqual, fail, deepStrictEqual } from "assert";

describe('parseInputs', () => {
	it('successful', () => strictEqual(
		parseInputs([{ type: 'uint256', arg: 123 }]),
		'000000000000000000000000000000000000000000000000000000000000007b',
	));
	describe('bool', () => {
		it('true', () => strictEqual(
			parseInputs([{ type: 'bool', arg: true }]),
			'0000000000000000000000000000000000000000000000000000000000000001',
		));
		it('false', () => strictEqual(
			parseInputs([{ type: 'bool', arg: false }]),
			'0000000000000000000000000000000000000000000000000000000000000000',
		));
		it('error', () => {
			try {
				parseInputs([{ type: 'bool', arg: 'not_a_bool' }]);
			} catch (error) {
				deepStrictEqual(error, {
					message: 'input is not a boolean',
					input: 'not_a_bool',
				});
				return;
			}
			fail();
		});
	});
});
