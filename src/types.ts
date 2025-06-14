/** TypeScript Omit (Exclude to be specific) does not work for objects with an "any" indexed type, and breaks discriminated unions */
export declare type EnhancedOmit<TRecordOrUnion, TKeyUnion>
	= string extends keyof TRecordOrUnion
		? TRecordOrUnion
		: TRecordOrUnion extends any
			? Pick<TRecordOrUnion, Exclude<keyof TRecordOrUnion, TKeyUnion>>
			: never;
