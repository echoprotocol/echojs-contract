import BN from 'bignumber.js';
import { PrivateKey, ChainStore } from 'echojs-lib';
import { view, call } from './echo-utils/executors';
import AbiFunction from './@types/abiFunction';

const MAX_CONTRACT_ID = new BN(2).pow(19).minus(1);

export default class Contract {
	[method: string]: ((...args: Array<any>) => Promise<any>) | any;

	private contractId: string;
	private accountId: string | null = null;
	private accountPrivateKey: PrivateKey | null = null;

	constructor(contractId: Number | BN | string, abi: Array<AbiFunction>) {
		if (typeof contractId === 'string') {
			if (!/^1\.16\.[1-9]\d*$/.test(contractId) || new BN(contractId.substr(5)).gt(MAX_CONTRACT_ID)) {
				throw new Error('invalid contractId format');
			}
		} else {
			const contractPostfix: BN = typeof contractId === 'number' ? new BN(contractId) : contractId as BN;
			if (contractPostfix.lte(0)) throw new Error('contractId is not positive');
			if (contractPostfix.gt(MAX_CONTRACT_ID)) throw new Error('contractId is too large');
			if (!contractPostfix.isInteger()) throw new Error('contractId is not integer');
			contractId = `1.16.${contractPostfix.toString()}`;
		}
		this.contractId = contractId;
		for (let abiFunction of abi) {
			if (abiFunction.type !== 'function') {
				console.warn(`${abiFunction.name}: ${abiFunction.type} is not implemented`);
				continue;
			}
			this[abiFunction.name] = async (...args: Array<any>) => {
				if (abiFunction.constant) return view(this.contractId, this.accountId, abiFunction, args);
				if (!this.accountId) throw new Error('is not authorized');
				return call(
					this.contractId,
					this.accountId as string,
					this.accountPrivateKey as PrivateKey,
					abiFunction,
					args,
				);
			}
		}
	}

	async setAccount(privateKey: PrivateKey) {
		const publicKey = privateKey.toPublicKey();
		this.accountId = await ChainStore.FetchChain('getAccountRefsOfKey', publicKey.toString())
			.then((res) => res.toJS()[0] as string);
		this.accountPrivateKey = privateKey;
	}

}
