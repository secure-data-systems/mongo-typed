import { BsonType, BsonTypeAlias, IntegerType, RegExpOrString, WithId } from './bson-types.js';
import { DotNotation, DotPathValue } from './dot-notation.js';
import { Expr } from './expr.js';

export declare type BitwiseFilter = number /** BinData bit mask */ | ReadonlyArray<number>;

export declare type Condition<T> = FilterOperators<T> | RegExpOrString<T>;

export declare interface Document {
	[key: string]: any
}

export declare type FilterOperations<T> = T extends Record<string, any> ? {
	[key in keyof T]?: FilterOperators<T[key]>;
} : FilterOperators<T>;

export declare interface FilterOperators<TValue> {
	$all?: TValue extends ReadonlyArray<infer U> ? ReadonlyArray<U> : never,
	$bitsAllClear?: TValue extends IntegerType ? BitwiseFilter : never,
	$bitsAllSet?: TValue extends IntegerType ? BitwiseFilter : never,
	$bitsAnyClear?: TValue extends IntegerType ? BitwiseFilter : never,
	$bitsAnySet?: TValue extends IntegerType ? BitwiseFilter : never,
	$elemMatch?: TValue extends ReadonlyArray<infer U> ? Filter<U> : never,
	$eq?: TValue,
	/**
	 * When `true`, `$exists` matches the documents that contain the field,
	 * including documents where the field value is null.
	 */
	$exists?: boolean,
	$expr?: Expr<TValue extends object ? TValue : object>,
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
	$ne?: RegExpOrString<TValue>,
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

export type Filter<TSchema> =
	TSchema extends object
	? RootFilterOperators<WithId<TSchema>> & {
		[P in DotNotation<TSchema>]?: Condition<DotPathValue<TSchema, P>>
	}
	: Condition<TSchema>;
