import 'mocha';
import { deepStrictEqual, notStrictEqual, strictEqual, throws } from 'assert';
import $c from 'comprehension';
import Contract from '../src/Contract';

describe('Contract', () => {
	describe('initializing', () => {
		// noinspection JSCheckFunctionSignatures
		it('abi is not an array', () => throws(() => new Contract('not_an_array'), { message: 'abi is not an array' }));
		it('function without a name', () => throws(
			() => new Contract([{ type: 'function' }]),
			{ message: 'function has no name' },
		));
		it(
			'type not equals to "function"',
			() => deepStrictEqual(new Contract([{ type: 'not_a_function' }]).methods, {}),
		);
		it('successful', () => {
			const abi = [{ type: 'function', name: 'qwe', inputs: [{ type: 'uint32', name: 'number' }] }];
			const contract = new Contract(abi);
			strictEqual(Object.keys(contract.methods).length, 3);
			strictEqual(typeof contract.methods.qwe, 'function');
			strictEqual(contract.methods['0x5a2f5928'], contract.methods.qwe);
			strictEqual(contract.methods['qwe(uint32)'], contract.methods.qwe);
			deepStrictEqual(contract.abi, abi);
		});
		it('abi getter clones', () => {
			const abi = [{ type: 'function', name: 'qwe', inputs: [{ type: 'uint32', name: 'number' }] }];
			const contract = new Contract(abi);
			notStrictEqual(contract.abi, abi);
			contract.abi.push({
				constant: false,
				inputs: [{ type: 'string', name: 'str' }],
				name: 'asd',
				outputs: [{ type: 'bool', name: 'success' }],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			});
			deepStrictEqual(abi, contract.abi);
		});
		it('two methods with same names', () => {
			const abi = [{
				constant: false,
				inputs: [{ type: 'uint32', name: 'num' }],
				name: 'qwe',
				outputs: [{ type: 'bool', name: 'success' }],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			}, {
				constant: false,
				inputs: [{ type: 'string', name: 'str' }],
				name: 'qwe',
				outputs: [{ type: 'bool', name: 'success' }],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			}];
			const contract = new Contract(abi);
			strictEqual(Object.keys(contract.methods).length, 4);
			strictEqual(typeof contract.methods.qwe, 'undefined');
			strictEqual(typeof contract.methods['0x5a2f5928'], 'function');
			strictEqual(contract.methods['qwe(uint32)'], contract.methods['0x5a2f5928']);
			strictEqual(typeof contract.methods['0xbb70fa38'], 'function');
			notStrictEqual(contract.methods['0xbb70fa38'], contract.methods['0x5a2f5928']);
			strictEqual(contract.methods['qwe(string)'], contract.methods['0xbb70fa38']);
		});
		it('getCode() method', () => {
			const abi = [{
				contract: false,
				inputs: [
					{ type: 'bytes24[3]', name: 'bytes72' },
					{ type: 'uint32[][2][]', name: 'multidimensional_array' },
					{ type: 'string', name: 'str' },
				],
				name: 'qwe',
				outputs: [{ type: 'bool', name: 'success' }],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			}];
			const contract = new Contract(abi);
			const methodInstance = contract.methods.qwe(
				[
					Buffer.from($c(24, (i) => i)),
					{ value: 'dead', align: 'left' },
					{ value: 'qwe', encoding: 'ascii', align: 'right' },
				],
				[[[], [1]], [[2, 3], [4, 5, 6]], [[7, 8], [9]]],
				' \\(ꙨပꙨ)// ',
			);
			deepStrictEqual(Object.keys(methodInstance), ['getCode']);
			strictEqual(methodInstance.getCode(), [
				'9c89d58f',
				'0000000000000000000102030405060708090a0b0c0d0e0f1011121314151617',
				'0000000000000000dead00000000000000000000000000000000000000000000',
				'0000000000000000000000000000000000000000000000000000000000717765',
				'00000000000000000000000000000000000000000000000000000000000000a0',
				'0000000000000000000000000000000000000000000000000000000000000180',
				'0000000000000000000000000000000000000000000000000000000000000003',
				'00000000000000000000000000000000000000000000000000000000000002c0',
				'00000000000000000000000000000000000000000000000000000000000001c0',
				'00000000000000000000000000000000000000000000000000000000000002e0',
				'0000000000000000000000000000000000000000000000000000000000000200',
				'0000000000000000000000000000000000000000000000000000000000000340',
				'0000000000000000000000000000000000000000000000000000000000000280',
				'0000000000000000000000000000000000000000000000000000000000000010',
				'205c28ea99a8e18095ea99a8292f2f2000000000000000000000000000000000',
				'0000000000000000000000000000000000000000000000000000000000000001',
				'0000000000000000000000000000000000000000000000000000000000000001',
				'0000000000000000000000000000000000000000000000000000000000000003',
				'0000000000000000000000000000000000000000000000000000000000000004',
				'0000000000000000000000000000000000000000000000000000000000000005',
				'0000000000000000000000000000000000000000000000000000000000000006',
				'0000000000000000000000000000000000000000000000000000000000000001',
				'0000000000000000000000000000000000000000000000000000000000000009',
				'0000000000000000000000000000000000000000000000000000000000000000',
				'0000000000000000000000000000000000000000000000000000000000000002',
				'0000000000000000000000000000000000000000000000000000000000000002',
				'0000000000000000000000000000000000000000000000000000000000000003',
				'0000000000000000000000000000000000000000000000000000000000000002',
				'0000000000000000000000000000000000000000000000000000000000000007',
				'0000000000000000000000000000000000000000000000000000000000000008',
			].join(''));
		});
	});
});
