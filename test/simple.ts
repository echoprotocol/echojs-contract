import { strictEqual } from 'assert';
import 'mocha';
import Contract, { deploy } from '../src';
import { PrivateKey } from 'echojs-lib';

describe('Simple', () => {
	let contract: Contract;

	before(async function () {
		this.timeout(12e3);
		contract = await deploy(Buffer.from(
			'608060405234801561001057600080fd5b5060fa8061001f6000396000f300608060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806326e4180e146044575b600080fd5b348015604f57600080fd5b506082600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505060c4565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b60008190509190505600a165627a7a723058203461195e63fbb1e18dfc7373ba71229354cf250873767ec4a455ffda71214e050029',
			'hex',
		), [{
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
		}], PrivateKey.fromWif('5KF7ZZ7J7USGm1WkVUBXDoC12bF8SYSaDP46GkUpHBU8Yuk7Wcf'))
	});

	it('view', async () => {
		const expectedAddress = '1.2.32';
		const actualAddress = await contract._address(expectedAddress);
		strictEqual(actualAddress, expectedAddress);
	});
});
