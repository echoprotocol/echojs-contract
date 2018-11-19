import "mocha";
import { ok, strictEqual } from "assert";
import { getCurrentBlockNumber } from "../src";
import { ChainStore } from "echojs-lib";

function checkBlockNumber(blockNumber: number) {
	strictEqual(typeof blockNumber, 'number');
	ok(Number.isFinite(blockNumber));
	ok(blockNumber > 0);
}

describe('getCurrentBlockNumber', () => {
	let blockNumber: number;
	it('successful', async () => {
		await ChainStore.init();
		blockNumber = await getCurrentBlockNumber();
		checkBlockNumber(blockNumber);
	});
	it('change on delay', async function () {
		this.timeout(7000);
		await new Promise((resolve) => setTimeout(() => resolve(), 5000));
		const newBlockNumber = await getCurrentBlockNumber();
		checkBlockNumber(newBlockNumber);
		ok(newBlockNumber > blockNumber);
		ok(newBlockNumber - blockNumber < 3);
	});
});
