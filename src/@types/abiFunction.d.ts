import SolType from './sol-type';

interface AbiFunction {
	constant: boolean;
	inputs: Array<{ name: string, type: SolType }>;
	name: string;
	outputs: Array<{ name: string, type: SolType }>;
	payable: boolean;
	stateMutability: 'view' | 'nonpayable' | 'payable' | 'pure';
	type: 'constructor' | 'function' | 'event';
}
