/** Dot notation that includes numeric array indices and properly maps for use in object keys */

import { And } from './types.js';

// DotNotation: Supports $ (if enabled), object keys, and arrays
export type DotNotation<
	T extends object,
	TAllowPlaceholder extends boolean = false,
	TPrefix extends string = '',
	TDepth extends number[] = []
> =
	TDepth['length'] extends 9
		? never
		: T extends readonly (infer U)[]
			? (
				| `${TPrefix}${number}`
				| DotNotation<NonNullable<U> extends object ? NonNullable<U> : never, TAllowPlaceholder, `${TPrefix}${number}.`, [...TDepth, 1]>
				| DotNotation<NonNullable<U> extends object ? NonNullable<U> : never, TAllowPlaceholder, `${TPrefix}`, [...TDepth, 1]>
				| (TAllowPlaceholder extends true
					? (
						| `${TPrefix}$[${string}]`
						| `${TPrefix}$`
						| DotNotation<NonNullable<U> extends object ? NonNullable<U> : never, TAllowPlaceholder, `${TPrefix}$.`, [...TDepth, 1]>
						| DotNotation<NonNullable<U> extends object ? NonNullable<U> : never, TAllowPlaceholder, `${TPrefix}$[${string}].`, [...TDepth, 1]>
						| DotNotation<NonNullable<U> extends object ? NonNullable<U> : never, TAllowPlaceholder, `${TPrefix}$[].`, [...TDepth, 1]>
					)
					: never)
			)
			: {
				[K in keyof T & string]:
					T[K] extends (...args: any[]) => any
						? never
						: (
							| `${TPrefix}${K}`
							| DotNotation<NonNullable<T[K]> extends object ? NonNullable<T[K]> : never, TAllowPlaceholder, `${TPrefix}${K}.`, [...TDepth, 1]>
						)
			}[keyof T & string];

/** Resolves a dot-notated path to the corresponding type, including array indexing */
// DotPathValue: Resolves value type of a dot path, optionally handling $ in arrays
export type DotPathValue<
	T,
	TPath extends string,
	TAllowPlaceholder extends boolean = false,
	TCheckInArray extends boolean = false,
	TIsInArray extends boolean = false,
	TDepth extends number[] = []
> =
	TDepth['length'] extends 9
		? never
		: TPath extends `${infer Key}.${infer Rest}`
			? T extends readonly (infer U)[]
				? Key extends `${number}`
					? DotPathValue<U, Rest, TAllowPlaceholder, TCheckInArray, TIsInArray, [...TDepth, 1]>
					: TAllowPlaceholder extends true
						? Key extends `$[${string}]` | `$[]` | `$`
							? DotPathValue<U, Rest, TAllowPlaceholder, TCheckInArray, true, [...TDepth, 1]>
							: never
						: never
				: Key extends string
					? T extends unknown
						? Key extends keyof T
							? DotPathValue<NonNullable<T[Key]>, Rest, TAllowPlaceholder, TCheckInArray, TIsInArray, [...TDepth, 1]>
							: T extends object
								? T[keyof T] extends infer V
									? V extends object
										? DotPathValue<V, Rest, TAllowPlaceholder, TCheckInArray, TIsInArray, [...TDepth, 1]>
										: never
									: never
								: never
						: never
					: never
			: T extends readonly (infer U)[]
				? U extends unknown
					? TPath extends `${number}`
						? And<TIsInArray, TCheckInArray, U[], U>
						: TAllowPlaceholder extends true
							? TPath extends `$[${string}]` | `$[]` | `$`
								? TCheckInArray extends true ? U[] : U
								: TPath extends keyof U
									? TCheckInArray extends true ? U[TPath][] : U[TPath]
									: never
							: TPath extends keyof U
								? TCheckInArray extends true ? U[TPath][] : U[TPath]
								: never
					: never
				: T extends unknown
					? TPath extends keyof T
						? And<TIsInArray, TCheckInArray, T[TPath][], T[TPath]>
						: never
					: never;

export type OnlyFieldsOfTypeDotNotation<
	T extends object,
	TFieldType,
	TAllowPlaceholder extends boolean = false,
	TCheckInArray extends boolean = false,
	TAssignableType = never
> = {
	[P in DotNotation<T, TAllowPlaceholder> as NonNullable<DotPathValue<T, P, TAllowPlaceholder, TCheckInArray>> extends TFieldType ? P : never]?:
		[TAssignableType] extends [never]
			? DotPathValue<T, P, TAllowPlaceholder, TCheckInArray>
			: TAssignableType;
};
