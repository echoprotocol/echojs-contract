import BN from 'bignumber.js';
import { PrivateKey, ChainStore } from 'echojs-lib';
import { view, call } from './echo-utils/executors';
import AbiFunction from '../typing/abiFunction';
import deploy from './echo-utils/deploy';

const MAX_CONTRACT_ID = new BN(2).pow(19).minus(1);

let defaultAccountId: string | null = null;
let defaultPrivateKey: PrivateKey | null = null;

export default class Contract {
	[method: string]: ((...args: Array<any>) => Promise<any>) | any;

	public readonly contractId: string;
	private accountId: string | null = null;
	private accountPrivateKey: PrivateKey | null = null;

	constructor(contractId: Number | BN | string, abi: Array<AbiFunction>) {
		if (typeof contractId === 'string') {
			if (!/^1\.16\.[1-9]\d*$/.test(contractId) || new BN(contractId.substr(5)).gt(MAX_CONTRACT_ID)) {
				throw new Error('invalid contractId format');
			}
		} else {
			if (typeof contractId === 'undefined') throw new Error('contractId is undefined');
			const contractPostfix: BN = typeof contractId === 'number' ? new BN(contractId) : contractId as BN;
			if (contractPostfix.lte(0)) throw new Error('contractId is not positive');
			if (contractPostfix.gt(MAX_CONTRACT_ID)) throw new Error('contractId is too large');
			if (!contractPostfix.isInteger()) throw new Error('contractId is not integer');
			contractId = `1.16.${contractPostfix.toString()}`;
		}
		this.contractId = contractId;
		for (let abiFunction of abi) {
			if (abiFunction.type !== 'function') {
				// console.warn(`${abiFunction.name}: ${abiFunction.type} is not implemented`);
				continue;
			}
			if (!abiFunction.name) throw new Error('function has no name');
			this[abiFunction.name as string] = async (...args: Array<any>) => {
				const accountId = this.accountId || defaultAccountId;
				const privateKey = this.accountPrivateKey || defaultPrivateKey;
				const isPayable = abiFunction.payable;
				const value = isPayable ? new BN(args.pop()).times(1e5).toNumber() : 0;
				if (abiFunction.constant) return view(this.contractId, accountId, abiFunction, args);
				if (!accountId) throw new Error('is not authorized');
				return call(
					this.contractId,
					accountId as string,
					privateKey as PrivateKey,
					abiFunction,
					args,
					value,
				);
			}
		}
	}

	getAccountId() {
		return this.accountId;
	}

	async setAccount(privateKey: PrivateKey) {
		const publicKey = privateKey.toPublicKey();
		this.accountId = await ChainStore.FetchChain('getAccountRefsOfKey', publicKey.toString())
			.then((res) => res.toJS()[0] as string);
		this.accountPrivateKey = privateKey;
	}

	public static deploy(
		bytecode: Buffer,
		abi: Array<AbiFunction>,
		privateKey: PrivateKey,
		args: Array<any>,
	): Promise<Contract> {
		return deploy(bytecode, abi, privateKey, args);
	}

}

export async function setDefaultAccount(privateKey: PrivateKey) {
	const publicKey = privateKey.toPublicKey();
	defaultAccountId = await ChainStore.FetchChain('getAccountRefsOfKey', publicKey.toString())
		.then((res) => res.toJS()[0] as string);
	defaultPrivateKey = privateKey;
}

export function getDefaultAccountId() {
	return defaultAccountId;
}

export function getDefaultPrivateKey(): PrivateKey | null {
	return defaultPrivateKey;
}
