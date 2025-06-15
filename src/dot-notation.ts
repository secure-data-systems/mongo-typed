/** Dot notation that includes numeric array indices and properly maps for use in object keys */
// DotNotation: Supports $ (if enabled), object keys, and arrays
export type DotNotation<
	T,
	TAllowPlaceholder extends boolean = false,
	TPrefix extends string = '',
	TDepth extends number[] = []
> =
	TDepth['length'] extends 9
		? never
		: T extends readonly (infer U)[]
			? (
				| `${TPrefix}${number}`
				| DotNotation<U, TAllowPlaceholder, `${TPrefix}${number}.`, [...TDepth, 1]>
				| DotNotation<U, TAllowPlaceholder, `${TPrefix}`, [...TDepth, 1]>
				| (TAllowPlaceholder extends true
					? (
						| `${TPrefix}$[${string}]`
						| DotNotation<U, TAllowPlaceholder, `${TPrefix}$.`, [...TDepth, 1]>
						| DotNotation<U, TAllowPlaceholder, `${TPrefix}$[${string}].`, [...TDepth, 1]>
						| DotNotation<U, TAllowPlaceholder, `${TPrefix}$[].`, [...TDepth, 1]>
					)
					: never)
			)
			: T extends object
				? {
					[K in keyof T & string]:
						| `${TPrefix}${K}`
						| DotNotation<T[K], TAllowPlaceholder, `${TPrefix}${K}.`, [...TDepth, 1]>
				}[keyof T & string]
				: never;

/** Resolves a dot-notated path to the corresponding type, including array indexing */
// DotPathValue: Resolves value type of a dot path, optionally handling $ in arrays
export type DotPathValue<
	T,
	TPath extends string,
	TAllowPlaceholder extends boolean = false,
	TDepth extends number[] = []
> =
	TDepth['length'] extends 9
		? never
		: TPath extends `${infer Key}.${infer Rest}`
			? T extends readonly (infer U)[]
				? Key extends `${number}`
					? DotPathValue<U, Rest, TAllowPlaceholder, [...TDepth, 1]>
					: TAllowPlaceholder extends true
						? Key extends `$[${string}]` | `$[]` | `$`
							? DotPathValue<U, Rest, TAllowPlaceholder, [...TDepth, 1]>[]
							: never
						: never
			: Key extends keyof T
				? DotPathValue<NonNullable<T[Key]>, Rest, TAllowPlaceholder, [...TDepth, 1]>
				: never
		: T extends readonly (infer U)[]
			? TPath extends `${number}`
				? U
				: TAllowPlaceholder extends true
					? TPath extends `$[${string}]` | `$[]` | `$`
						? U[]
						: never
					: never
		: TPath extends keyof T
			? T[TPath]
			: never;

export type OnlyFieldsOfTypeDotNotation<
	T,
	TFieldType,
	TAllowPlaceholder extends boolean = false,
	TAssignableType = TFieldType
> = {
	[P in DotNotation<T, TAllowPlaceholder> as DotPathValue<T, P, TAllowPlaceholder> extends TFieldType ? P : never]?: TAssignableType;
};
