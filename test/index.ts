import "mocha";
import { connect } from "../src";

it('init tests', () => null);

if (!process.env.NO_TEST_CHAIN) {
	describe("connect", () => {
		it("successful", async function () {
			this.timeout(5e3);
			await connect("wss://echo-dev.io/ws");
		});
	});
}

import("./outputParser");

if (!process.env.NO_TEST_CHAIN) {
	import("./getCurrentBlockNumber");
	import("./dynamicArrays");
	import("./payable");
	import("./string");
	import("./defaultAccount");
}
