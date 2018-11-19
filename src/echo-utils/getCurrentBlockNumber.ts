import { ChainStore } from "echojs-lib";

export default async function getCurrentBlockNumber(): Promise<number> {
	return ChainStore.FetchChain('getAsset', '2.1.0').then((res) => res.toJS().head_block_number);
}
