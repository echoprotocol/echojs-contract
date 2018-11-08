import "mocha";
import { connect } from "../src";

describe("connect", () => {
	it("successful", () => connect("wss://echo-dev.io/ws"));
});

import("./dynamicArrays");
