import { NumericBsonType } from './bson-types.js';
import { DotNotation } from './dot-notation.js';

export type ArrayExpr<TInput extends object> =
	| Array<unknown>
	| FieldRef<TInput>
	| { $concatArrays: ArrayExpr<TInput>[] }
	| { $filter: { as?: string, cond: BooleanExpr<TInput>, input: ArrayExpr<TInput> } }
	| { $literal: Array<unknown> }
	| { $map: { as?: string, in: Expr<TInput>, input: ArrayExpr<TInput> } }
	| { $range: [NumericExpr<TInput>, NumericExpr<TInput>, NumericExpr<TInput>?] }
	| { $reduce: { in: Expr<TInput>, initialValue: Expr<TInput>, input: ArrayExpr<TInput> } }
	| { $reverseArray: ArrayExpr<TInput> }
	| { $setDifference: [ArrayExpr<TInput>, ArrayExpr<TInput>] }
	| { $setIntersection: [ArrayExpr<TInput>, ArrayExpr<TInput>] }
	| { $setUnion: [ArrayExpr<TInput>, ArrayExpr<TInput>] }
	| { $slice: [ArrayExpr<TInput>, NumericExpr<TInput>, NumericExpr<TInput>?] }
	| { $zip: { defaults?: ArrayExpr<TInput>, inputs: ArrayExpr<TInput>[], useLongestLength?: boolean } };

export type BooleanExpr<TInput extends object> =
	| boolean
	| FieldRef<TInput>
	| { $allElementsTrue: ArrayExpr<TInput> }
	| { $and: ArrayExpr<TInput> }
	| { $anyElementTrue: ArrayExpr<TInput> }
	| { $eq: [Expr<TInput>, Expr<TInput>] }
	| { $gt: [Expr<TInput>, Expr<TInput>] }
	| { $gte: [Expr<TInput>, Expr<TInput>] }
	| { $in: [Expr<TInput>, ArrayExpr<TInput>] }
	| { $literal: boolean }
	| { $lt: [Expr<TInput>, Expr<TInput>] }
	| { $lte: [Expr<TInput>, Expr<TInput>] }
	| { $ne: [Expr<TInput>, Expr<TInput>] }
	| { $nin: [Expr<TInput>, ArrayExpr<TInput>] }
	| { $nor: Expr<TInput>[] }
	| { $not: Expr<TInput> }
	| { $or: Expr<TInput>[] }
	| { $regexMatch: { input: StringExpr<TInput>, options?: StringExpr<TInput>, regex: StringExpr<TInput> } }
	| { $setEquals: [ArrayExpr<TInput>, ArrayExpr<TInput>] }
	| { $setIsSubset: [ArrayExpr<TInput>, ArrayExpr<TInput>] };

export interface ConditionalExpr<TInput extends object> {
	$cond?:
		[Expr<TInput>, Expr<TInput>, Expr<TInput>]
		| {
			else: Expr<TInput>,
			if: Expr<TInput>,
			then: Expr<TInput>
		},
	$ifNull?: [Expr<TInput>, Expr<TInput>],
	$switch?: {
		branches: {
			case: Expr<TInput>,
			then: Expr<TInput>
		}[],
		default: Expr<TInput>
	}
}

export type DateExpr<TInput extends object> =
	| Date
	| FieldRef<TInput>
	| { $dateFromParts: { day?: NumericExpr<TInput>, hour?: NumericExpr<TInput>, millisecond?: NumericExpr<TInput>, minute?: NumericExpr<TInput>, month?: NumericExpr<TInput>, second?: NumericExpr<TInput>, timezone?: StringExpr<TInput>, year: NumericExpr<TInput> } }
	| { $dateFromString: { dateString: StringExpr<TInput>, format?: StringExpr<TInput>, onError?: Expr<TInput>, onNull?: Expr<TInput>, timezone?: StringExpr<TInput> } }
	| { $literal: Date };

export interface DatePartsExpr<TInput extends object> {
	$dateToParts: { date: DateExpr<TInput>, iso8601?: BooleanExpr<TInput>, timezone?: StringExpr<TInput> }
}

export interface DateTimezoneExpr<TInput extends object> {
	date: DateExpr<TInput>,
	timezone: StringExpr<TInput>
}

export type Expr<T extends object> =
	| ArrayExpr<T>
	| BooleanExpr<T>
	| ConditionalExpr<T>
	| DateExpr<T>
	| DatePartsExpr<T>
	| NumericExpr<T>
	| StringExpr<T>
	| TypeExpr<T>
	| VariableExpr<T>;

export type FieldPaths<T extends object> = DotNotation<T> extends infer U ? U & string : never;

export type FieldRef<T extends object> = `$${FieldPaths<T>}`;

export type NumericExpr<TInput extends object> =
	| FieldRef<TInput>
	| number
	| { $abs: NumericExpr<TInput> }
	| { $acos: NumericExpr<TInput> }
	| { $acosh: NumericExpr<TInput> }
	| { $add: (DateExpr<TInput> | NumericExpr<TInput>)[] }
	| { $asin: NumericExpr<TInput> }
	| { $asinh: NumericExpr<TInput> }
	| { $atan: NumericExpr<TInput> }
	| { $atanh: NumericExpr<TInput> }
	| { $ceil: NumericExpr<TInput> }
	| { $convert: { input: Expr<TInput>, onError?: Expr<TInput>, onNull?: Expr<TInput>, to: NumericBsonType | { type: NumericBsonType } } }
	| { $cos: NumericExpr<TInput> }
	| { $cosh: NumericExpr<TInput> }
	| { $dateDiff: { endDate: DateExpr<TInput>, startDate: DateExpr<TInput>, timezone?: StringExpr<TInput>, unit: StringExpr<TInput> } }
	| { $dayOfMonth?: DateExpr<TInput> | DateTimezoneExpr<TInput> }
	| { $dayOfWeek?: DateExpr<TInput> | DateTimezoneExpr<TInput> }
	| { $dayOfYear?: DateExpr<TInput> | DateTimezoneExpr<TInput> }
	| { $degreesToRadians: NumericExpr<TInput> }
	| { $divide: [NumericExpr<TInput>, NumericExpr<TInput>] }
	| { $exp: NumericExpr<TInput> }
	| { $floor: NumericExpr<TInput> }
	| { $hour?: DateExpr<TInput> | DateTimezoneExpr<TInput> }
	| { $isoDayOfWeek?: DateExpr<TInput> | DateTimezoneExpr<TInput> }
	| { $isoWeek?: DateExpr<TInput> | DateTimezoneExpr<TInput> }
	| { $isoWeekYear?: DateExpr<TInput> | DateTimezoneExpr<TInput> }
	| { $literal: number }
	| { $ln: NumericExpr<TInput> }
	| { $log10: NumericExpr<TInput> }
	| { $log: [NumericExpr<TInput>, NumericExpr<TInput>] } // [value, base]
	| { $millisecond?: DateExpr<TInput> | DateTimezoneExpr<TInput> }
	| { $minute?: DateExpr<TInput> | DateTimezoneExpr<TInput> }
	| { $mod: [NumericExpr<TInput>, NumericExpr<TInput>] }
	| { $month?: DateExpr<TInput> | DateTimezoneExpr<TInput> }
	| { $multiply: NumericExpr<TInput>[] }
	| { $pow: [NumericExpr<TInput>, NumericExpr<TInput>] }
	| { $radiansToDegrees: NumericExpr<TInput> }
	| { $rand: Record<string, never> }
	| { $round: [NumericExpr<TInput>, NumericExpr<TInput>] | NumericExpr<TInput> }
	| { $second?: DateExpr<TInput> | DateTimezoneExpr<TInput> }
	| { $sin: NumericExpr<TInput> }
	| { $sinh: NumericExpr<TInput> }
	| { $size: ArrayExpr<TInput> }
	| { $sqrt: NumericExpr<TInput> }
	| { $strLenBytes: StringExpr<TInput> }
	| { $strLenCP: StringExpr<TInput> }
	| { $subtract: [DateExpr<TInput>, DateExpr<TInput>] }
	| { $subtract: [DateExpr<TInput> | NumericExpr<TInput>, NumericExpr<TInput>] }
	| { $tan: NumericExpr<TInput> }
	| { $tanh: NumericExpr<TInput> }
	| { $toDecimal: Expr<TInput> }
	| { $toDouble: Expr<TInput> }
	| { $toInt: Expr<TInput> }
	| { $toLong: Expr<TInput> }
	| { $trunc: [NumericExpr<TInput>, NumericExpr<TInput>] | NumericExpr<TInput> }
	| { $week?: DateExpr<TInput> | DateTimezoneExpr<TInput> }
	| { $year?: DateExpr<TInput> | DateTimezoneExpr<TInput> }
;

export type StringExpr<TInput extends object> =
	| FieldRef<TInput>
	| string
	| { $concat: StringExpr<TInput>[] }
	| { $dateToString: { date: DateExpr<TInput>, format?: StringExpr<TInput>, onNull?: Expr<TInput>, timezone?: StringExpr<TInput> } }
	| { $literal: string }
	| { $ltrim: { chars?: StringExpr<TInput>, input: StringExpr<TInput> } }
	| { $replaceAll: { find: StringExpr<TInput>, input: StringExpr<TInput>, replacement: StringExpr<TInput> } }
	| { $replaceOne: { find: StringExpr<TInput>, input: StringExpr<TInput>, replacement: StringExpr<TInput> } }
	| { $rtrim: { chars?: StringExpr<TInput>, input: StringExpr<TInput> } }
	| { $substr: [StringExpr<TInput>, NumericExpr<TInput>, NumericExpr<TInput>] }
	| { $substrBytes: [StringExpr<TInput>, NumericExpr<TInput>, NumericExpr<TInput>] }
	| { $substrCP: [StringExpr<TInput>, NumericExpr<TInput>, NumericExpr<TInput>] }
	| { $toLower: StringExpr<TInput> }
	| { $toString: Expr<TInput> }
	| { $toUpper: StringExpr<TInput> }
	| { $trim: { chars?: StringExpr<TInput>, input: StringExpr<TInput> } };

export interface TypeExpr<TInput extends object> {
	$type?: Expr<TInput>
}

export type VariableExpr<TInput extends object> =
	| { $let?: { in: Expr<TInput>, vars: Record<string, Expr<TInput>> } }
	| { $map?: { as: string, in: Expr<TInput>, input: ArrayExpr<TInput> } }
	| { $reduce?: { in: Expr<TInput>, initialValue: Expr<TInput>, input: ArrayExpr<TInput> } };
