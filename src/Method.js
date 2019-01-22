import { Echo } from 'echojs-lib';
import decode from './decoders';
import { checkContractId } from './utils/validators';

const NATHAN_ID = '1.2.12';

/** @typedef {import("./Contract").default} Contract */
/** @typedef {import("../types/_Abi").AbiArgument} AbiArgument */

/**
 * @typedef {Object} CallOptions
 * @property {string} [contractId]
 * @property {string} [assetId]
 * @property {string} [accountId]
 * @property {Echo} [echo]
 */

export default class Method {

	/** @type {string} */
	get code() { return this._code; }

	constructor(contract, abiMethodOutputs, code) {
		/**
		 * @private
		 * @type {Contract}
		 */
		this._contract = contract;
		/**
		 * @private
		 * @type {Array<AbiArgument>}
		 */
		this._abiMethodOutputs = abiMethodOutputs;
		/**
		 * @private
		 * @type {string}
		 */
		this._code = code;
	}

	/**
	 * @param {CallOptions} [options]
	 * @returns {Promise<Array<*>|*|null>}
	 */
	async call(options = {}) {
		let { contractId, assetId, accountId, echo } = options;
		if (contractId === undefined) {
			if (this._contract.address === undefined) throw new Error('no contractId');
			contractId = this._contract.address;
		} else checkContractId(contractId);
		if (assetId === undefined) assetId = '1.3.0';
		else if (!/^1\.3\.(0|[1-9]\d*)$/.test(assetId)) throw new Error('invalid assetId format');
		if (accountId === undefined) accountId = NATHAN_ID;
		else if (!/^1\.2\.(0|[1-9]\d*)$/.test(accountId)) throw new Error('invalid accountId format');
		if (echo === undefined) {
			if (this._contract.echo === undefined) throw new Error('no echo instance');
			echo = this._contract.echo;
		} else if (!(echo instanceof Echo)) throw new Error('invalid echo instance');
		// FIXME: remove @type when JSDoc of callContractNoChangingState will be fixed
		/** @type {string} */
		const rawResult = await echo.api.callContractNoChangingState(contractId, accountId, assetId, this.code);
		if (rawResult === '') {
			if (this._abiMethodOutputs.length === 0) return null;
			throw new Error('call failed');
		}
		return decode(rawResult, this._abiMethodOutputs.map(({ type }) => type));
	}

}
