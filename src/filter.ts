import { BsonType, BsonTypeAlias, RegExpOrString, WithId } from './bson-types.js';
import { DotNotation, DotPathValue } from './dot-notation.js';
import { EnhancedOmit } from './types.js';

/**
 * It is possible to search using alternative types in mongodb e.g.
 * string types can be searched using a regex in mongo
 * array types can be searched using their element type
 */
export declare type AlternativeType<T> = T extends ReadonlyArray<infer U> ? RegExpOrString<U> | T : RegExpOrString<T>;

/** @public */
export declare type BitwiseFilter = number /** BinData bit mask */ | ReadonlyArray<number>;

/** @public */
export declare type Condition<T> = AlternativeType<T> | FilterOperators<AlternativeType<T>>;

export declare interface Document {
	[key: string]: any
}

export declare type Filter<TSchema> = RootFilterOperators<WithId<TSchema>> & {
	[P in DotNotation<EnhancedOmit<TSchema, '_id'>>]?: Condition<DotPathValue<EnhancedOmit<TSchema, '_id'>, P>>;
} & { _id?: Condition<string> };

/** @public */
export declare type FilterOperations<T> = T extends Record<string, any> ? {
	[key in keyof T]?: FilterOperators<T[key]>;
} : FilterOperators<T>;

/** @public */
export declare interface FilterOperators<TValue> {
	$all?: ReadonlyArray<any>,
	$bitsAllClear?: BitwiseFilter,
	$bitsAllSet?: BitwiseFilter,
	$bitsAnyClear?: BitwiseFilter,
	$bitsAnySet?: BitwiseFilter,
	$elemMatch?: Document,
	$eq?: TValue,
	/**
	 * When `true`, `$exists` matches the documents that contain the field,
	 * including documents where the field value is null.
	 */
	$exists?: boolean,
	$expr?: Record<string, any>,
	$geoIntersects?: {
		$geometry: Document
	},
	$geoWithin?: Document,
	$gt?: TValue,
	$gte?: TValue,
	$in?: ReadonlyArray<TValue>,
	$jsonSchema?: Record<string, any>,
	$lt?: TValue,
	$lte?: TValue,
	$maxDistance?: number,
	$mod?: TValue extends number ? [number, number] : never,
	$ne?: TValue,
	$near?: Document,
	$nearSphere?: Document,
	$nin?: ReadonlyArray<TValue>,
	$not?: TValue extends string ? FilterOperators<TValue> | RegExp : FilterOperators<TValue>,
	$options?: TValue extends string ? string : never,
	$rand?: Record<string, never>,
	$regex?: TValue extends string ? RegExp | string : never,
	$size?: TValue extends ReadonlyArray<any> ? number : never,
	$type?: BsonType | BsonTypeAlias
}

export declare interface RootFilterOperators<TSchema> {
	$and?: Filter<TSchema>[],
	$comment?: Document | string,
	$nor?: Filter<TSchema>[],
	$or?: Filter<TSchema>[],
	$text?: {
		$caseSensitive?: boolean,
		$diacriticSensitive?: boolean,
		$language?: string,
		$search: string
	},
	$where?: ((this: TSchema) => boolean) | string
}
