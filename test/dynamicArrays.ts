import Contract, { deploy } from "../src";
import { PrivateKey } from "echojs-lib";
import BigNumber from "bignumber.js";
import $ from "comprehension";
import { strictEqual, ok } from "assert";

describe('send dynamic array', () => {
	it('send uint32[] and get it\'s size', async function () {
		this.timeout(13e3);
		interface TestContract extends Contract {
			send(arr: Array<number | BigNumber>): Promise<void>;
			length(): Promise<BigNumber>;
		}
		const contract = <TestContract>await deploy(Buffer.from(
			'608060405234801561001057600080fd5b50610217806100206000396000f30060806040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680631f7b6d3214610051578063b80dcea81461007c575b600080fd5b34801561005d57600080fd5b506100666100e2565b6040518082815260200191505060405180910390f35b34801561008857600080fd5b506100e0600480360381019080803590602001908201803590602001908080602002602001604051908101604052809392919081815260200183836020028082843782019150505050505091929192905050506100ee565b005b60008080549050905090565b8060009080519060200190610104929190610108565b5050565b828054828255906000526020600020906007016008900481019282156101a75791602002820160005b8382111561017557835183826101000a81548163ffffffff021916908363ffffffff1602179055509260200192600401602081600301049283019260010302610131565b80156101a55782816101000a81549063ffffffff0219169055600401602081600301049283019260010302610175565b505b5090506101b491906101b8565b5090565b6101e891905b808211156101e457600081816101000a81549063ffffffff0219169055506001016101be565b5090565b905600a165627a7a72305820fd2cb5e86db9c7bf0c0ee39d141a3962fae65b09395d5857bb68d6dd17525a8b0029',
			'hex',
		), [{
			constant: false,
			inputs: [{ name: "arr", type: "uint32[]" }],
			name: "send",
			outputs: [],
			payable: false,
			stateMutability: "nonpayable",
			type: "function"
		}, {
			constant: true,
			inputs: [],
			name: "length",
			outputs: [{ name: "", type: "uint256" }],
			payable: false,
			stateMutability: "view",
			type: "function"
		}], PrivateKey.fromWif('5KF7ZZ7J7USGm1WkVUBXDoC12bF8SYSaDP46GkUpHBU8Yuk7Wcf'));
		const length = Math.floor(Math.random() * 8) + 3;
		const arr = $(length, () => Math.floor(Math.random() * 2 ** 31));
		await contract.send(arr);
		ok(await contract.length().then((res) => res.eq(length)));
	});
});
