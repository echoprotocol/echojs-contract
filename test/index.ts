import "mocha";
import { connect } from "../src";

describe("connect", () => {
	it("successful", async function () {
		this.timeout(5e3);
		await connect("wss://echo-dev.io/ws");
	});
});

import("./dynamicArrays");
import("./payable");
import("./string");
