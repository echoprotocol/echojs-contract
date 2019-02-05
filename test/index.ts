import "mocha";
import { connect } from "../src";

it('init tests', () => null);

if (!process.env.NO_TEST_CHAIN) {
	describe("connect", () => {
		it("successful", async function () {
			this.timeout(5e3);
			await connect("ws://195.201.164.54:6311");
		});
	});
}

import("./outputParser");
import("./parseInputs");

if (!process.env.NO_TEST_CHAIN) {
	import("./getCurrentBlockNumber");
	import("./dynamicArrays");
	import("./payable");
	import("./string");
	import("./defaultAccount");
}
