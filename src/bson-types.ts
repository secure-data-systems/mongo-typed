import { EnhancedOmit } from './types.js';

export declare const BSONType: Readonly<{
	readonly array: 4,
	readonly binData: 5,
	readonly bool: 8,
	readonly date: 9,
	readonly dbPointer: 12,
	readonly decimal: 19,
	readonly double: 1,
	readonly int: 16,
	readonly javascript: 13,
	readonly javascriptWithScope: 15,
	readonly long: 18,
	readonly maxKey: 127,
	readonly minKey: -1,
	readonly null: 10,
	readonly object: 3,
	readonly objectId: 7,
	readonly regex: 11,
	readonly string: 2,
	readonly symbol: 14,
	readonly timestamp: 17,
	readonly undefined: 6
}>;

export declare type BsonType = (typeof BSONType)[keyof typeof BSONType];

export declare type BsonTypeAlias = keyof typeof BSONType;

export declare type IntegerType = bigint | number;

export declare type NumericType = IntegerType;

export declare interface ObjectIdLike {
	__id?: string,
	id: string | Uint8Array,
	toHexString(): string
}

export declare type RegExpOrString<T> = T extends string ? RegExp | T : T;

/** Add an _id field to an object shaped type */
export declare type WithId<TSchema> = EnhancedOmit<TSchema, '_id'> & {
	_id: string
};
