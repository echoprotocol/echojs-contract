import Contract, { connect } from "../src";
import 'mocha';

describe('connect', () => {
	it('successful', () => connect('wss://echo-dev.io/ws'));
});

describe('Contract', () => {
	import('./simple');
});

