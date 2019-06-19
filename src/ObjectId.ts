function isValidTypeId(value: number, maxValue: number) {
	return Number.isSafeInteger(value) && value >= 0 && value <= maxValue;
}

export enum RESERVED_SPACE {
	RELATIVE_PROTOCOL = 0,
	PROTOCOL = 1,
	IMPLEMENTATION = 2,
}

export function isReservedSpaceId(reservedSpaceId: number) {
	return isValidTypeId(reservedSpaceId, RESERVED_SPACE.IMPLEMENTATION);
}

export enum PROTOCOL_OBJECT_TYPE {
	NULL = 0,
	BASE = 1,
	ACCOUNT = 2,
	ASSET = 3,
	FORCE_SETTLEMENT = 4,
	COMMITTEE_MEMBER = 5,
	LIMIT_ORDER = 6,
	CALL_ORDER = 7,
	CUSTOM = 8,
	PROPOSAL = 9,
	OPERATION_HISTORY = 10,
	WITHDRAW_PERMISSION = 11,
	VESTING_BALANCE = 12,
	BALANCE = 13,
	CONTRACT = 14,
	CONTRACT_RESULT = 15,
	BLOCK_RESULT = 16,
	ETH_ADDRESS = 17,
	DEPOSIT_ETH = 18,
	WITHDRAW_ETH = 19,
	OBJECT_TYPE_COUNT = 20,
}

export function isProtocolObjectTypeId(protocolObjectTypeId: number) {
	return isValidTypeId(protocolObjectTypeId, PROTOCOL_OBJECT_TYPE.OBJECT_TYPE_COUNT);
}

export enum IMPLEMENTATION_OBJECT_TYPE {
	GLOBAL_PROPERTY = 0,
	DYNAMIC_GLOBAL_PROPERTY = 1,
	ASSET_DYNAMIC_DATA = 2,
	ASSET_BITASSET_DATA = 3,
	ACCOUNT_BALANCE = 4,
	ACCOUNT_STATISTICS = 5,
	TRANSACTION = 6,
	BLOCK_SUMMARY = 7,
	ACCOUNT_TRANSACTION_HISTORY = 8,
	CHAIN_PROPERTY = 9,
	BUDGET_RECORD = 10,
	SPECIAL_AUTHORITY = 11,
	BUYBACK_OBJECT = 12,
	COLLATERAL_BID = 13,
	CONTRACT_BALANCE = 14,
	CONTRACT_HISTORY = 15,
	CONTRACT_STATISTICS = 16,
	ACCOUNT_ADDRESS = 17,
	CONTRACT_POOL = 18,
}

export function isImplementationObjectTypeId(implementationObjectTypeId: number) {
	return isValidTypeId(implementationObjectTypeId, IMPLEMENTATION_OBJECT_TYPE.CONTRACT_POOL);
}

export type ObjectTypeOf<T extends RESERVED_SPACE> = {
	[RESERVED_SPACE.RELATIVE_PROTOCOL]: never;
	[RESERVED_SPACE.PROTOCOL]: PROTOCOL_OBJECT_TYPE;
	[RESERVED_SPACE.IMPLEMENTATION]: IMPLEMENTATION_OBJECT_TYPE;
}[T];

export default class ObjectId<T extends RESERVED_SPACE> {
	static fromString(id: string): ObjectId<RESERVED_SPACE.PROTOCOL | RESERVED_SPACE.IMPLEMENTATION> {
		const idParts = id.split('.');
		if (idParts.length !== 3) throw new Error('invalid object id format');
		const [reservedSpaceId, objectTypeId, index] = idParts.map((part) => Number.parseFloat(part));
		if (!isReservedSpaceId(reservedSpaceId)) throw new Error('invalid reserved space id');
		switch (reservedSpaceId) {
			case RESERVED_SPACE.RELATIVE_PROTOCOL:
				throw new Error('relative protocol objects are not implemented');
			case RESERVED_SPACE.PROTOCOL:
				if (!isProtocolObjectTypeId(objectTypeId)) throw new Error('invalid protocol object type id');
				break;
			case RESERVED_SPACE.IMPLEMENTATION:
				if (!isImplementationObjectTypeId(objectTypeId)) {
					throw new Error('invalid implementation object type id');
				}
				break;
		}
		return new ObjectId(reservedSpaceId, objectTypeId, index);
	}

	private _index: number = 0;
	public get index() {
		return this._index;
	}
	public set index(index: number) {
		if (Number.isNaN(index) || !Number.isSafeInteger(index) || index < 0) {
			throw new Error('index is not a non-negative integer');
		}
		this._index = index;
	}

	constructor(public reservedSpace: T, public objectType: ObjectTypeOf<T>, index: number) {
		this.index = index;
	}

	toString() {
		return `${this.reservedSpace}.${this.objectType}.${this.index}`;
	}
}

export class ProtocolObjectId extends ObjectId<RESERVED_SPACE.PROTOCOL> {
	static fromString(id: string): ProtocolObjectId {
		const result = super.fromString(id);
		if (result.reservedSpace !== RESERVED_SPACE.PROTOCOL) throw new Error('is not a protocol object id');
		return result as ProtocolObjectId;
	}

	constructor(protocolObjectType: PROTOCOL_OBJECT_TYPE, index: number) {
		super(RESERVED_SPACE.PROTOCOL, protocolObjectType, index);
	}
}

export class AccountId extends ProtocolObjectId {
	static fromString(id: string): AccountId {
		const result = super.fromString(id);
		if (result.objectType !== PROTOCOL_OBJECT_TYPE.ACCOUNT) throw new Error('is not a account id');
		return result as AccountId;
	}

	constructor(index: number) {
		super(PROTOCOL_OBJECT_TYPE.ACCOUNT, index);
	}
}

export class ContractId extends ProtocolObjectId {
	static fromString(id: string): ContractId {
		const result = super.fromString(id);
		if (result.objectType !== PROTOCOL_OBJECT_TYPE.CONTRACT) throw new Error('is not a contract id');
		return result as ContractId;
	}

	constructor(index: number) {
		super(PROTOCOL_OBJECT_TYPE.CONTRACT, index);
	}
}
