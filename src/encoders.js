import BigNumber from 'bignumber.js';
import $c from 'comprehension';
import { toTwosComplementRepresentation } from './utils/number-representations';

/**
 * @param {boolean} value
 * @returns {string}
 */
export function encodeBool(value) {
	if (typeof value !== 'boolean') throw new Error('value is not a boolean');
	return $c(63, () => '0').join('') + (value ? '1' : '0');
}

function checkIntegerSize(bitsCount) {
	if (typeof bitsCount !== 'number') throw new Error('bits count is not a number');
	if (bitsCount <= 0) throw new Error('bits count is not positive');
	if (bitsCount > 256) throw new Error('bits count is greater than 256');
	if (!Number.isSafeInteger(bitsCount)) throw new Error('bits count is not a integer');
	if (bitsCount % 8 !== 0) throw new Error('bits count is not divisible to 8');
}

/**
 * @param {number|BigNumber} value
 * @returns {BigNumber}
 */
function toBigInteger(value) {
	if (typeof value === 'number') {
		if (value > Number.MAX_SAFE_INTEGER) throw new Error('loss of accuracy, use bignumber.js');
		value = new BigNumber(value);
	}
	if (!BigNumber.isBigNumber(value)) throw new Error('value is not a number');
	if (!value.isInteger()) throw new Error('value is not a integer');
	return value;
}

/**
 * @param {number} bitsCount
 * @param {number|BigNumber} value
 * @returns {string}
 */
export function encodeUnsignedInteger(bitsCount, value) {
	checkIntegerSize(bitsCount);
	value = toBigInteger(value);
	if (value.isNegative()) throw new Error('value is negative');
	if (value.gte(new BigNumber(2).pow(bitsCount))) {
		throw new Error(`uint${bitsCount} overloading`);
	}
	const preRes = value.toString(16);
	return $c(64 - preRes.length, () => '0').join('') + preRes;
}

/**
 * @param {number} bitsCount
 * @param {number|BigNumber} value
 * @returns {string}
 */
export function encodeInteger(bitsCount, value) {
	checkIntegerSize(bitsCount);
	value = toBigInteger(value);
	if (value.abs().gte(new BigNumber(2).pow(bitsCount - 1))) throw new Error(`int${bitsCount} overloading`);
	const twosComplementRepresentation = toTwosComplementRepresentation(value, bitsCount);
	return encodeUnsignedInteger(bitsCount, twosComplementRepresentation);
}

/**
 * @param {string} address
 * @returns {string}
 */
export function encodeAddress(address) {
	if (typeof address !== 'string') throw new Error('address is not a string');
	if (!/^1\.(2|16)\.(([1-9]\d*)|0)$/.test(address)) throw new Error('invalid address format');
	const [, instanceTypeId, objectId] = address.split('.').map((str) => new BigNumber(str, 10));
	const preRes = objectId.toString(16);
	if (preRes.length > 38) throw new Error('objectId is greater or equals to 2**152');
	const isContract = instanceTypeId.eq(16);
	return [
		$c(25, () => 0).join(''),
		isContract ? '1' : '0',
		$c(38 - preRes.length, () => 0).join(''),
		preRes,
	].join('');
}

/** @typedef {'hex'|'ascii'|'utf8'|'utf16le'|'ucs2'|'base64'|'latin1'|'binary'} Encoding */

/**
 * @param {number} bytesCount
 * @param {Buffer|string|{value:Buffer|string,encoding:Encoding,align:'left'|'right'|'none'}} input
 * @return {string}
 */
export function encodeStaticBytes(bytesCount, input) {
	const defaultEncoding = 'hex';
	const defaultAlign = 'none';
	if (Buffer.isBuffer(input) || typeof input !== 'object') {
		input = { value: input, encoding: defaultEncoding, align: defaultAlign };
	}
	input.encoding = input.encoding || defaultEncoding;
	input.align = input.align || defaultAlign;
	if (typeof bytesCount !== 'number') throw new Error('bytes count is not a number');
	if (bytesCount <= 0) throw new Error('bytes count is not positive');
	if (!Number.isSafeInteger(bytesCount)) throw new Error('bytes count is not a integer');
	if (bytesCount > 32) throw new Error('bytes count is grater than 32');
	if (!Buffer.isBuffer(input.value)) {
		if (input.encoding === 'hex' && input.value.substr(0, 2) === '0x') input.value = input.value.substr(2);
		if (input.encoding === 'hex' && !/^([\da-fA-F]{2}){1,32}$/.test(input.value)) {
			throw new Error('input is not a hex string');
		}
		input.value = Buffer.from(input.value, input.encoding);
	}
	if (input.value.length !== bytesCount) {
		if (input.value.length > bytesCount) throw new Error('input is too large');
		if (input.align === 'none') throw new Error('input is too short, maybe u need to use align?');
		const arr = Array.from(input.value);
		const zeros = $c(bytesCount - input.value.length, () => 0);
		if (input.align === 'left') input.value = Buffer.from([...arr, ...zeros]);
		else if (input.align === 'right') input.value = Buffer.from([...zeros, ...arr]);
		else throw new Error('unknown align');
	}
	return input.value.toString('hex').padStart(64, '0');
}

/** @typedef {{ type: ('dynamic'|'static'), code: Array.<string|_ArrayCode>, length: number }} _ArrayCode */

/**
 * @param {string|Buffer} value
 * @param {Encoding} encoding
 * @returns {_ArrayCode}
 */
export function encodeDynamicBytes(value, encoding = 'hex') {
	if (typeof value === 'string') value = Buffer.from(value, encoding);
	const partsCount = Math.ceil(value.length / 32);
	/** @type {Array<string>} */
	const code = $c({ count: partsCount, step: 32 }, (i) => value.slice(i, i + 32).toString('hex'));
	const lastCodeIndex = partsCount - 1;
	if (code[lastCodeIndex].length !== 64) {
		code[lastCodeIndex] = $c(64 - code[lastCodeIndex].length, () => '0').join('') + code[lastCodeIndex];
	}
	return { type: 'dynamic', length: value.length, code };
}

/**
 * @param {string} value
 * @param {Encoding} encoding
 * @returns {_ArrayCode}
 */
export function encodeString(value, encoding = 'utf8') {
	return encodeDynamicBytes(value, encoding);
}

/**
 * @param {SolType} type
 * @param {Array.<*>} value
 * @returns {_ArrayCode}
 */
export function encodeDynamicArray(value, type) {
	if (!Array.isArray(value)) throw new Error('value is not an array');
	return { type: 'dynamic', length: value.length, code: value.map((element) => encodeArgument(element, type)) };
}

/**
 * @param {SolType} type
 * @param {Array.<*>} value
 * @param {number} length
 * @returns {_ArrayCode}
 */
export function encodeStaticArray(value, type, length) {
	if (length !== value.length) throw new Error('invalid array elements count');
	if (!Array.isArray(value)) throw new Error('value is not an array');
	return { type: 'static', length, code: value.map((element) => encodeArgument(element, type)) };
}

/**
 * @param {*} value
 * @param {SolType} type
 * @returns {string|_ArrayCode}
 */
export function encodeArgument(value, type) {
	const dynamicArrayMatch = type.match(/^(.*)\[]$/);
	if (dynamicArrayMatch) {
		const type = dynamicArrayMatch[1];
		return encodeDynamicArray(value, type);
	}
	const staticArrayMatch = type.match(/^(.*)\[(\d+)]$/);
	if (staticArrayMatch) {
		const type = staticArrayMatch[1];
		const length = Number.parseInt(staticArrayMatch[2], 10);
		return encodeStaticArray(value, type, length);
	}
	const bytesMatch = type.match(/^bytes(\d+)$/);
	if (bytesMatch) {
		const length = Number.parseInt(bytesMatch[1], 10);
		return encodeStaticBytes(length, value);
	}
	const unsignedIntegerMatch = type.match(/^uint(\d+)$/);
	if (unsignedIntegerMatch) {
		const bitsCount = Number.parseInt(unsignedIntegerMatch[1], 10);
		return encodeUnsignedInteger(bitsCount, value);
	}
	const signedIntegerMatch = type.match(/^int(\d+)$/);
	if (signedIntegerMatch) {
		const bitsCount = Number.parseInt(signedIntegerMatch[1], 10);
		return encodeInteger(bitsCount, value);
	}
	if (type === 'bool') return encodeBool(value);
	if (type === 'address') return encodeAddress(value);
	if (type === 'string') return encodeString(value);
	throw new Error(`unknown type ${type}`);
}

/**
 * @param {Array.<{ value: *, type: SolType }>|{ value: *, type: SolType }} input
 * @returns {string}
 */
export function encode(input) {
	if (!Array.isArray(input)) input = [input];
	let result = input.map(({ value, type }) => encodeArgument(value, type));
	let post = [];
	do {
		for (const { link, arr, length } of post) {
			result[link] = encodeUnsignedInteger(256, result.length * 32);
			result.push(encodeUnsignedInteger(256, length), ...arr);
		}
		post = [];
		for (let i = 0; i < result.length; i++) {
			if (typeof result[i] === 'string') continue;
			if (result[i].type === 'static') {
				result = [
					...result.slice(0, i),
					...result[i].code,
					...result.slice(i + 1),
				];
				i -= 1;
				continue;
			}
			post.push({ link: i, arr: result[i].code, length: result[i].length });
			result[i] = null;
		}
	} while (post.length > 0);
	return result.join('');
}