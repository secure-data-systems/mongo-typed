import { RewrapArray, UnwrapArray } from './array.js';
import { IntegerType, NumericType } from './bson-types.js';
import { DotNotation, DotPathValue, OnlyFieldsOfTypeDotNotation } from './dot-notation.js';
import { Filter } from './filter.js';
import { Identifiable, PartialButId } from './identifiable.js';
import { EnhancedOmit } from './types.js';

export declare type FieldsAndValues<TSchema, TAllowPlaceholder extends boolean = false> = Readonly<{
	[P in DotNotation<EnhancedOmit<TSchema, '_id'>, TAllowPlaceholder>]?:
		DotPathValue<EnhancedOmit<TSchema, '_id'>, P, TAllowPlaceholder> extends infer Value
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
			? PartialButId<Item> |
			{
				$each: PartialButId<Item>[],
				$position?: number,
				$slice?: number,
				$sort?: -1 | 1 | Partial<Record<DotNotation<PartialButId<Item>>, -1 | 1>>
			}
			: Item |
				{
					$each: Item[],
					$position?: number,
					$slice?: number,
					$sort?: Item extends object ? -1 | 1 | Partial<Record<DotNotation<Item>, -1 | 1>> : -1 | 1
				}
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
	$bit?: OnlyFieldsOfTypeDotNotation<TSchema, NumericType | undefined, true, {
		and: IntegerType
	} | {
		or: IntegerType
	} | {
		xor: IntegerType
	}>,
	$currentDate?: OnlyFieldsOfTypeDotNotation<TSchema, Date, true, true | { $type: 'date' | 'timestamp' }>,
	$inc?: OnlyFieldsOfTypeDotNotation<TSchema, NumericType | undefined, true, NumericType | undefined>,
	$max?: FieldsAndValues<TSchema, true>,
	$min?: FieldsAndValues<TSchema, true>,
	$mul?: OnlyFieldsOfTypeDotNotation<TSchema, NumericType | undefined, true>,
	$pop?: OnlyFieldsOfTypeDotNotation<TSchema, ReadonlyArray<any> | undefined, false, -1 | 1>,
	$pull?: PullOperator<TSchema>,
	$pullAll?: PullAllOperator<TSchema>,
	$push?: PushOperator<TSchema>,
	$rename?: Record<string, string>,
	$set?: FieldsAndValues<TSchema, true>,
	$setOnInsert?: FieldsAndValues<TSchema>,
	$unset?: OnlyFieldsOfTypeDotNotation<TSchema, any, false, 1 | '' | true>
}
