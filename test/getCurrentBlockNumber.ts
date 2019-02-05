import "mocha";
import { ok, strictEqual } from "assert";
import { getCurrentBlockNumber } from "../src";

function checkBlockNumber(blockNumber: number) {
	strictEqual(typeof blockNumber, 'number');
	ok(Number.isFinite(blockNumber));
	ok(blockNumber > 0);
}

describe('getCurrentBlockNumber', () => {
	let blockNumber: number;
	it('successful', async () => {
		blockNumber = await getCurrentBlockNumber();
		checkBlockNumber(blockNumber);
	});
	it('change on delay', async function () {
		this.timeout(7000);
		await new Promise((resolve) => setTimeout(() => resolve(), 5000));
		const newBlockNumber = await getCurrentBlockNumber();
		checkBlockNumber(newBlockNumber);
		ok(newBlockNumber > blockNumber);
		ok(newBlockNumber - blockNumber > 0);
		ok(newBlockNumber - blockNumber < 5);
	});
});
