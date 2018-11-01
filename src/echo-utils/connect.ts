import { Apis } from 'echojs-ws';

export default async function connect(address: string): Promise<void> {
	const instance = Apis.instance(address, true);
	await instance.init_promise;
}
