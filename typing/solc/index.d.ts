declare module "solc" {
	
	export function compile(input: string, optimise: number): {
		contracts: {
			[key: string]: { bytecode: string, interface: string },
		},
	};

}
