import { BigNumber } from "echojs-lib";

type OUTPUT = {
	boolean: boolean;
	small_integer: number;
	big_integer: BigNumber;
	address: string;
	string: string;
	bytes: Buffer;
}

export default OUTPUT;
