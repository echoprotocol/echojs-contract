import "mocha";
import { parseInputs } from "../src";
import { ok, strictEqual } from "assert";

describe('parseInputs', () => {
	it('successful', () => strictEqual(
		parseInputs([{ type: 'uint256', arg: 123 }]),
		'000000000000000000000000000000000000000000000000000000000000007b',
	));
});
