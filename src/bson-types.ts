import { EnhancedOmit } from './types.js';

export const BsonType = {
	array: 'array',
	binData: 'binData',
	bool: 'bool',
	date: 'date',
	dbPointer: 'dbPointer',
	decimal: 'decimal',
	double: 'double',
	int: 'int',
	javascript: 'javascript',
	javascriptWithScope: 'javascriptWithScope',
	long: 'long',
	maxKey: 'maxKey',
	minKey: 'minKey',
	null: 'null',
	object: 'object',
	objectId: 'objectId',
	regex: 'regex',
	string: 'string',
	symbol: 'symbol',
	timestamp: 'timestamp',
	undefined: 'undefined'
} as const;

export declare const BsonTypeNumeric: Readonly<{
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

export declare type BsonType = typeof BsonType[keyof typeof BsonType];

export declare type BsonTypeNumeric = (typeof BsonTypeNumeric)[keyof typeof BsonTypeNumeric];

export declare type IntegerType = bigint | number;

export declare type NumericType = IntegerType;

export declare type RegExpOrString<T> = T extends string ? RegExp | T : T;

/** Add an _id field to an object shaped type */
export declare type WithId<TSchema> = EnhancedOmit<TSchema, '_id'> & {
	_id: string
};

export type NumericBsonType =
	| 1 | 16 | 18 | 19 // Numeric aliases
	| 'decimal' | 'double' | 'int' | 'long';
