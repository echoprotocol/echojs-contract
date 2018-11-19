import { ChainStore, PublicKey, PrivateKey } from "echojs-lib";

export default async function getAccountId(privateKey: PrivateKey): Promise<string> {
	const publicKey = privateKey.toPublicKey();
	const callResult = await ChainStore.FetchChain('getAccountRefsOfKey', publicKey.toString());
	const result = callResult.toJS()[0] as string;
	if (!result) throw new Error('unable to login');
	return result;
}
