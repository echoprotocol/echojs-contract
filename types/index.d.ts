import { PrivateKey, Echo, BigNumber } from 'echojs-lib';
import { Abi } from './_Abi';

declare class Method<T = null> {
	readonly code: string;
	constructor(contract: Contract, abiMethodotputs: Abi, code: string);

	call(options?: {
		contractId?: string,
		assetId?: string,
		accountId?: string,
		echo?: Echo,
	}): Promise<T>;

}

declare class Contract {

	static deploy(
		code: Buffer | string,
		echo: Echo,
		privateKey: PrivateKey,
		options?: {
			ethAccuracy?: boolean,
			supportedAssetId?: string,
			value?: { amount?: number | string | BigNumber, asset_id?: string },
		},
	): Promise<string>;

	static deploy(
		code: Buffer | string,
		echo: Echo,
		privateKey: PrivateKey,
		options: {
			abi: Abi,
			ethAccuracy?: boolean,
			supportedAssetId?: string,
			value?: { amount?: number | string | BigNumber, asset_id?: string },
		},
	): Promise<Contract>;

	readonly namesDublications: Set<string>;
	readonly methods: { [nameOrHashOrSignature: string]: (...args: Array<any>) => Method };
	constructor(abi: Abi, options?: { echo: Echo, contractId: string });
	abi: Abi;
	echo: Echo;
	address?: string;
}

export default Contract;
export { Abi, Method };
export { PrivateKey, default as echo, Echo, BigNumber } from "echojs-lib";
