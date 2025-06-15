import { NumericBsonType } from './bson-types.js';

export type ArrayExpr =
	| Array<unknown>
	| FieldRef
	| { $concatArrays: ArrayExpr[] }
	| { $filter: { as?: string, cond: BooleanExpr, input: ArrayExpr } }
	| { $literal: Array<unknown> }
	| { $map: { as?: string, in: Expr, input: ArrayExpr } }
	| { $range: [NumericExpr, NumericExpr, NumericExpr?] }
	| { $reduce: { in: Expr, initialValue: Expr, input: ArrayExpr } }
	| { $reverseArray: ArrayExpr }
	| { $setDifference: [ArrayExpr, ArrayExpr] }
	| { $setIntersection: [ArrayExpr, ArrayExpr] }
	| { $setUnion: [ArrayExpr, ArrayExpr] }
	| { $slice: [ArrayExpr, NumericExpr, NumericExpr?] }
	| { $zip: { defaults?: ArrayExpr, inputs: ArrayExpr[], useLongestLength?: boolean } };

export type BooleanExpr =
	| boolean
	| FieldRef
	| { $allElementsTrue: ArrayExpr }
	| { $and: ArrayExpr }
	| { $anyElementTrue: ArrayExpr }
	| { $eq: [Expr, Expr] }
	| { $gt: [Expr, Expr] }
	| { $gte: [Expr, Expr] }
	| { $in: [Expr, ArrayExpr] }
	| { $literal: boolean }
	| { $lt: [Expr, Expr] }
	| { $lte: [Expr, Expr] }
	| { $ne: [Expr, Expr] }
	| { $nin: [Expr, ArrayExpr] }
	| { $nor: Expr[] }
	| { $not: Expr }
	| { $or: Expr[] }
	| { $regexMatch: { input: StringExpr, options?: StringExpr, regex: StringExpr } }
	| { $setEquals: [ArrayExpr, ArrayExpr] }
	| { $setIsSubset: [ArrayExpr, ArrayExpr] };

export interface ConditionalExpr {
	$cond?:
		[Expr, Expr, Expr]
		| {
			else: Expr,
			if: Expr,
			then: Expr
		},
	$ifNull?: [Expr, Expr],
	$switch: {
		branches: {
			case: Expr,
			then: Expr
		}[],
		default: Expr
	}
}

export type DateExpr =
	| Date
	| FieldRef
	| { $dateFromParts: { day?: NumericExpr, hour?: NumericExpr, millisecond?: NumericExpr, minute?: NumericExpr, month?: NumericExpr, second?: NumericExpr, timezone?: StringExpr, year: NumericExpr } }
	| { $dateFromString: { dateString: StringExpr, format?: StringExpr, onError?: Expr, onNull?: Expr, timezone?: StringExpr } }
	| { $literal: Date }
;

export interface DatePartsExpr {
	$dateToParts: { date: DateExpr, iso8601?: BooleanExpr, timezone?: StringExpr }
}

export interface DateTimezoneExpr {
	date: DateExpr,
	timezone: StringExpr
}

export type Expr<T = unknown> =
	| ArrayExpr
	| BooleanExpr
	| ConditionalExpr
	| DateExpr
	| DatePartsExpr
	| NumericExpr
	| StringExpr
	| TypeExpr
	| VariableExpr;

export type FieldRef = `$${string}`;

export type NumericExpr =
	| FieldRef
	| number
	| { $abs: NumericExpr }
	| { $acos: NumericExpr }
	| { $acosh: NumericExpr }
	| { $add: (DateExpr | NumericExpr)[] }
	| { $asin: NumericExpr }
	| { $asinh: NumericExpr }
	| { $atan: NumericExpr }
	| { $atanh: NumericExpr }
	| { $ceil: NumericExpr }
	| { $convert: { input: Expr, onError?: Expr, onNull?: Expr, to: NumericBsonType | { type: NumericBsonType } } }
	| { $cos: NumericExpr }
	| { $cosh: NumericExpr }
	| { $dateDiff: { endDate: DateExpr, startDate: DateExpr, timezone?: StringExpr, unit: StringExpr } }
	| { $dayOfMonth?: DateExpr | DateTimezoneExpr }
	| { $dayOfWeek?: DateExpr | DateTimezoneExpr }
	| { $dayOfYear?: DateExpr | DateTimezoneExpr }
	| { $degreesToRadians: NumericExpr }
	| { $divide: [NumericExpr, NumericExpr] }
	| { $exp: NumericExpr }
	| { $floor: NumericExpr }
	| { $hour?: DateExpr | DateTimezoneExpr }
	| { $isoDayOfWeek?: DateExpr | DateTimezoneExpr }
	| { $isoWeek?: DateExpr | DateTimezoneExpr }
	| { $isoWeekYear?: DateExpr | DateTimezoneExpr }
	| { $literal: number }
	| { $ln: NumericExpr }
	| { $log10: NumericExpr }
	| { $log: [NumericExpr, NumericExpr] } // [value, base]
	| { $millisecond?: DateExpr | DateTimezoneExpr }
	| { $minute?: DateExpr | DateTimezoneExpr }
	| { $mod: [NumericExpr, NumericExpr] }
	| { $month?: DateExpr | DateTimezoneExpr }
	| { $multiply: NumericExpr[] }
	| { $pow: [NumericExpr, NumericExpr] }
	| { $radiansToDegrees: NumericExpr }
	| { $rand: Record<string, never> }
	| { $round: [NumericExpr, NumericExpr] | NumericExpr }
	| { $second?: DateExpr | DateTimezoneExpr }
	| { $sin: NumericExpr }
	| { $sinh: NumericExpr }
	| { $size: ArrayExpr }
	| { $sqrt: NumericExpr }
	| { $strLenBytes: StringExpr }
	| { $strLenCP: StringExpr }
	| { $subtract: [DateExpr, DateExpr] }
	| { $subtract: [DateExpr | NumericExpr, NumericExpr] }
	| { $tan: NumericExpr }
	| { $tanh: NumericExpr }
	| { $toDecimal: Expr }
	| { $toDouble: Expr }
	| { $toInt: Expr }
	| { $toLong: Expr }
	| { $trunc: [NumericExpr, NumericExpr] | NumericExpr }
	| { $week?: DateExpr | DateTimezoneExpr }
	| { $year?: DateExpr | DateTimezoneExpr }
;

export type StringExpr =
	| FieldRef
	| string
	| { $concat: StringExpr[] }
	| { $dateToString: { date: DateExpr, format?: StringExpr, onNull?: Expr, timezone?: StringExpr } }
	| { $literal: string }
	| { $ltrim: { chars?: StringExpr, input: StringExpr } }
	| { $replaceAll: { find: StringExpr, input: StringExpr, replacement: StringExpr } }
	| { $replaceOne: { find: StringExpr, input: StringExpr, replacement: StringExpr } }
	| { $rtrim: { chars?: StringExpr, input: StringExpr } }
	| { $substr: [StringExpr, NumericExpr, NumericExpr] }
	| { $substrBytes: [StringExpr, NumericExpr, NumericExpr] }
	| { $substrCP: [StringExpr, NumericExpr, NumericExpr] }
	| { $toLower: StringExpr }
	| { $toString: Expr }
	| { $toUpper: StringExpr }
	| { $trim: { chars?: StringExpr, input: StringExpr } };

export interface TypeExpr {
	$type?: Expr
}

export type VariableExpr =
	| { $let?: { in: Expr, vars: Record<string, Expr> } }
	| { $map?: { as: string, in: Expr, input: ArrayExpr } }
	| { $reduce?: { in: Expr, initialValue: Expr, input: ArrayExpr } };

type OnlyOneKey<T> = {
	[K in keyof T]: { [P in K]: T[P] } & Partial<Record<Exclude<keyof T, K>, never>>
}[keyof T];
