<<<<<<< HEAD
import { PrivateKey, Echo, BigNumber, Transaction } from 'echojs-lib';
import * as EchoJSLib from 'echojs-lib';
import { ContractResult as ApiContractResult } from 'echojs-lib/types/echo/api';
import { BroadcastingResult } from 'echojs-lib/types/echo/transaction';
import { Abi } from './_Abi';

declare class ContractResult<T, TEvents> {
	readonly transactionResult: BroadcastingResult;
	readonly contractResult: ApiContractResult;
	readonly decodedResult: T;
	readonly events: TEvents;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

type ContractTransaction<T, TEvents> = Omit<Transaction, 'broadcast'> & {
	broadcast(wasBroadcastedCallback?: () => any): Promise<ContractResult<T, TEvents>>;
};

declare class Method<T = any, TEvents = { [eventName: string]: { [field: string]: any } }> {
=======
import { PrivateKey, Echo, BigNumber } from 'echojs-lib';
import { Abi } from './_Abi';

declare class Method<T = null> {
>>>>>>> 1.0.0
	readonly code: string;
	constructor(contract: Contract, abiMethodotputs: Abi, code: string);

	call(options?: {
		contractId?: string,
		assetId?: string,
		accountId?: string,
		echo?: Echo,
	}): Promise<T>;

<<<<<<< HEAD
	buildTransaction(options?: {
		contractId?: string,
		registrar?: string,
		privateKey?: PrivateKey,
		value?: { amount?: number | string | BigNumber, asset_id?: string },
	}): ContractTransaction<T, TEvents>;

	buildTransaction(options?: {
		contractId?: string,
		privateKey: PrivateKey,
		value?: { amount?: number | string | BigNumber, asset_id?: string },
	}): Promise<ContractTransaction<T, TEvents>>;

	broadcast(options?: {
		contractId?: string,
		registrar?: string,
		privateKey: PrivateKey,
		value?: { amount?: number | string | BigNumber, asset_id?: string },
	}): Promise<ContractResult<T, TEvents>>;

}

declare class Contract<TDeployArgs = Array<any>> {

	__TDeployArgs__: TDeployArgs;
=======
}

declare class Contract {
>>>>>>> 1.0.0

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

<<<<<<< HEAD
	static deploy<T = Array<any>>(
=======
	static deploy(
>>>>>>> 1.0.0
		code: Buffer | string,
		echo: Echo,
		privateKey: PrivateKey,
		options: {
			abi: Abi,
			ethAccuracy?: boolean,
			supportedAssetId?: string,
			value?: { amount?: number | string | BigNumber, asset_id?: string },
<<<<<<< HEAD
			args?: any,
=======
>>>>>>> 1.0.0
		},
	): Promise<Contract>;

	readonly namesDublications: Set<string>;
	readonly methods: { [nameOrHashOrSignature: string]: (...args: Array<any>) => Method };
<<<<<<< HEAD
	constructor(abi: Abi, options?: { echo?: Echo, contractId?: string });
	abi: Abi;
	echo: Echo;
	address?: string;
	deploy(code: Buffer | string, privateKey: PrivateKey, options?: {
		ethAccuracy?: boolean,
		supportedAssetId?: string,
		value?: { amount?: number | string | BigNumber, asset_id?: string },
		args?: TDeployArgs,
	}): Promise<Contract<TDeployArgs>>;
	parseLogs(logs: Array<{ address?: string, log: [string], data: string }>): {
		[event: string]: { [field: string]: any },
	};
	fallback(
		privateKey: PrivateKey,
		value: number | string | BigNumber,
		assetId?: string,
	): Promise<ContractResult<null, any>>;
}

declare function generateInterface(contractName: string, abi: Abi, indent?: string): string;

export default Contract;
export { Abi, Method, generateInterface, EchoJSLib };
=======
	constructor(abi: Abi, options?: { echo: Echo, contractId: string });
	abi: Abi;
	echo: Echo;
	address?: string;
}

export default Contract;
export { Abi, Method };
>>>>>>> 1.0.0
export { PrivateKey, default as echo, Echo, BigNumber } from "echojs-lib";
