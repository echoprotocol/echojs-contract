import { strictEqual } from 'assert';
import 'mocha';
import Contract from '../src';

describe('Simple', () => {
	it('view', async () => {
		const contract = new Contract('1.16.19449', [{
			constant: true,
			inputs: [{
				name: 'input',
				type: 'address',
			}],
			name: '_address',
			outputs: [{
				name: 'output',
				type: 'address',
			}],
			payable: false,
			stateMutability: 'pure',
			type: 'function',
		}]);
		const expectedAddress = '1.2.32';
		const actualAddress = await contract._address(expectedAddress);
		strictEqual(actualAddress, expectedAddress);
	});
});
