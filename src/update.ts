import { RewrapArray, UnwrapArray } from './array.js';
import { IntegerType, NumericType } from './bson-types.js';
import { DotNotation, DotPathValue, OnlyFieldsOfTypeDotNotation } from './dot-notation.js';
import { Filter } from './filter.js';
import { Identifiable, PartialButId } from './identifiable.js';
import { EnhancedOmit } from './types.js';

export declare type FieldsAndValues<TSchema> = Readonly<{
	[P in DotNotation<EnhancedOmit<TSchema, '_id'>>]?:
		DotPathValue<EnhancedOmit<TSchema, '_id'>, P> extends infer Value
			? UnwrapArray<Value> extends infer Unwrapped
				? Unwrapped extends Identifiable
					? RewrapArray<Value, PartialButId<Unwrapped>>
					: Value
				: never
			: never;
}>;

export declare type PullAllOperator<T> = {
	[P in DotNotation<T> as DotPathValue<T, P> extends ReadonlyArray<any> | undefined ? P : never]?:
		NonNullable<DotPathValue<T, P>> extends ReadonlyArray<infer Item>
			? Item extends Identifiable
				? ReadonlyArray<PartialButId<Item>> : ReadonlyArray<Item>
		: never;
};

export declare type PullOperator<T> = {
	[P in DotNotation<T> as DotPathValue<T, P> extends ReadonlyArray<any> | undefined ? P : never]?:
		NonNullable<DotPathValue<T, P>> extends ReadonlyArray<infer Item>
			? Filter<Item>
		: never;
};

export declare type PushOperator<T> = {
	[P in DotNotation<T> as DotPathValue<T, P> extends ReadonlyArray<any> | undefined ? P : never]?:
		NonNullable<DotPathValue<T, P>> extends ReadonlyArray<infer Item>
			? Item extends Identifiable
				? PartialButId<Item> | { '$each': PartialButId<Item>[] } : Item | { '$each': Item[] }
		: never;
};

export declare type SetFields<T> = {
	[P in DotNotation<T> as DotPathValue<T, P> extends ReadonlyArray<any> | undefined ? P : never]?:
		NonNullable<DotPathValue<T, P>> extends ReadonlyArray<infer Item>
			? Item extends Identifiable
				? PartialButId<Item> | { $each: ReadonlyArray<PartialButId<Item>> }
				: Item | { $each: ReadonlyArray<Item> }
		: never;
};

export declare interface Update<TSchema> {
	$addToSet?: SetFields<TSchema>,
	$bit?: OnlyFieldsOfTypeDotNotation<TSchema, NumericType | undefined, {
		and: IntegerType
	} | {
		or: IntegerType
	} | {
		xor: IntegerType
	}>,
	$currentDate?: OnlyFieldsOfTypeDotNotation<TSchema, Date, true | { $type: 'date' | 'timestamp' }>,
	$inc?: OnlyFieldsOfTypeDotNotation<TSchema, NumericType | undefined>,
	$max?: FieldsAndValues<TSchema>,
	$min?: FieldsAndValues<TSchema>,
	$mul?: OnlyFieldsOfTypeDotNotation<TSchema, NumericType | undefined>,
	$pop?: OnlyFieldsOfTypeDotNotation<TSchema, ReadonlyArray<any> | undefined, -1 | 1>,
	$pull?: PullOperator<TSchema>,
	$pullAll?: PullAllOperator<TSchema>,
	$push?: PushOperator<TSchema>,
	$rename?: Record<string, string>,
	$set?: FieldsAndValues<TSchema>,
	$setOnInsert?: FieldsAndValues<TSchema>,
	$unset?: OnlyFieldsOfTypeDotNotation<TSchema, any, 1 | '' | true>
}
