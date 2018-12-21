import 'mocha';
import { strictEqual } from 'assert';
import { expect } from 'chai';
import { decodeBool } from '../../src/decoders';

describe('bool', () => {
	it('failure', () => expect(() => decodeBool('not_a_boolean')).to.throw(Error, 'unable to decode bool'));
	it('true', () => {
		strictEqual(decodeBool('0000000000000000000000000000000000000000000000000000000000000001'), true);
	});
	it('false', () => {
		strictEqual(decodeBool('0000000000000000000000000000000000000000000000000000000000000000'), false);
	});
});
