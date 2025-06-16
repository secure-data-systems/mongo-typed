/** TypeScript Omit (Exclude to be specific) does not work for objects with an "any" indexed type, and breaks discriminated unions */
export declare type EnhancedOmit<TRecordOrUnion, TKeyUnion>
	= string extends keyof TRecordOrUnion
		? TRecordOrUnion
		: TRecordOrUnion extends any
			? Pick<TRecordOrUnion, Exclude<keyof TRecordOrUnion, TKeyUnion>>
			: never;

export type Assert<T extends true> = T;

// Utility types for compile-time assertions
export type Equals<TExpected, TActual> =
	(<V>() => V extends TExpected ? 1 : 2) extends
	(<V>() => V extends TActual ? 1 : 2) ? true : false;

export type Includes<TUnion, TValue> = TValue extends TUnion ? true : false;

export type NonFunctionKeys<T> = {
	[K in keyof T & string]: T[K] extends (...args: any[]) => any ? never : K
}[keyof T & string];

// Utility to unwrap nullables and undefined
export type NonNullableField<T> = Exclude<T, null | undefined>;

export type OnlyOneKey<T> = {
	[K in keyof T]: { [P in K]: T[P] } & Partial<Record<Exclude<keyof T, K>, never>>
}[keyof T];
