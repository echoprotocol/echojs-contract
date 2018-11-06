import 'mocha';
import { strictEqual, fail } from 'assert';
import { PrivateKey } from 'echojs-lib';
import Contract, { connect, deploy } from '../src';
import $ from 'comprehension';
import SolType from '../@types/sol-type';
import { StateMutability, FunctionType } from '../@types/abiFunction';

describe('connect', () => {
	it('successful', () => connect('wss://echo-dev.io/ws'));
});

describe('Contract', () => {
	import('./simple');
});

import('./dynamicArrays');

describe('constructor arguments', () => {
	it('uint32', async function () {
		this.timeout(12e3);
		const randomId = Math.floor(Math.random() * 2 ** 31);
		const contract = await deploy(Buffer.from(
			"608060405234801561001057600080fd5b5060405160208061011f83398101806040528101908080519060200190929190505050806000806101000a81548163ffffffff021916908363ffffffff1602179055505060bd806100626000396000f300608060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680635d1ca631146044575b600080fd5b348015604f57600080fd5b5060566078565b604051808263ffffffff1663ffffffff16815260200191505060405180910390f35b60008060009054906101000a900463ffffffff169050905600a165627a7a72305820e87c140040f3b86115d689e7983b6c5b4de704847db77983beaff0bc550d3e600029",
			"hex",
		), [{
			inputs: [{
				name: "id",
				type: "uint32",
			}],
			payable: false,
			stateMutability: "nonpayable",
			type: "constructor",
		}, {
			constant: true,
			inputs: [],
			name: "getId",
			outputs: [{
				name: "",
				type: "uint32"
			}],
			payable: false,
			stateMutability: "view",
			type: "function"
		}], PrivateKey.fromWif('5KF7ZZ7J7USGm1WkVUBXDoC12bF8SYSaDP46GkUpHBU8Yuk7Wcf'), [randomId]);
		strictEqual(await contract.getId(), randomId);
	})
});

describe('parseInput', () => {
	describe('bytesN', () => {
		let contract: Contract | null = null;
		before(async function () {
			this.timeout(12e3);
			contract = await deploy(Buffer.from(
				'608060405234801561001057600080fd5b5060e58061001f6000396000f300608060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806357a6909c146044575b600080fd5b348015604f57600080fd5b50607b60048036038101908080356bffffffffffffffffffffffff1916906020019092919050505060af565b60405180826bffffffffffffffffffffffff19166bffffffffffffffffffffffff1916815260200191505060405180910390f35b60008190509190505600a165627a7a7230582070d3dee94d19f24b8b8d626867fec0c67ddeaffd70d3540ff1bf00563d26954b0029',
				'hex',
			), [{
				"constant": true,
				"inputs": [
					{
						"name": "input",
						"type": "bytes20"
					}
				],
				"name": "setBuffer",
				"outputs": [
					{
						"name": "output",
						"type": "bytes20"
					}
				],
				"payable": false,
				"stateMutability": "pure",
				"type": "function"
			}], PrivateKey.fromWif('5KF7ZZ7J7USGm1WkVUBXDoC12bF8SYSaDP46GkUpHBU8Yuk7Wcf'));
		});
		describe('align', () => {
			it('default', async () => {
				try {
					await contract!.setBuffer('qwe');
				} catch (error) {
					strictEqual(error.message, 'buffer is too short');
					return;
				}
				fail();
			});
			it('left', async () => strictEqual(
				await contract!.setBuffer({ value: 'asd', align: 'left' })
					.then((res: Buffer) => res.toString('hex')),
				'6173640000000000000000000000000000000000',
			));
			it('right', async () => strictEqual(
				await contract!.setBuffer({ value: 'asd', align: 'right' })
					.then((res: Buffer) => res.toString('hex')),
				'0000000000000000000000000000000000617364',
			));
		});
		it('get account id', () => strictEqual(contract!.getAccountId(), '1.2.1117'));
	});
});
