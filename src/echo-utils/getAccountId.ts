import { ChainStore, PublicKey, PrivateKey } from "echojs-lib";

export default async function getAccountId(privateKey: PrivateKey): Promise<string> {
	const publicKey = privateKey.toPublicKey();
	const callResult = await ChainStore.FetchChain('getAccountRefsOfKey', publicKey.toString());
	return callResult.toJS()[0] as string;
}
