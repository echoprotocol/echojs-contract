import SolType from './sol-type';

export type StateMutability = 'view' | 'nonpayable' | 'payable' | 'pure';
export type FunctionType = 'constructor' | 'function' | 'event';

export default interface AbiFunction {
	constant?: boolean;
	inputs: Array<{ name: string, type: SolType }>;
	name?: string;
	outputs?: Array<{ name: string, type: SolType }>;
	payable: boolean;
	stateMutability: StateMutability;
	type: FunctionType;
}
