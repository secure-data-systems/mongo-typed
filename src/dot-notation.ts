/** Dot notation that includes numeric array indices and properly maps for use in object keys */
export type DotNotation<T, TPrefix extends string = '', TDepth extends number[] = []> =
	TDepth['length'] extends 9
		? never
		: T extends readonly (infer U)[]
			? | DotNotation<U, `${TPrefix}${number}.`, [...TDepth, 1]> // posts.0.title
			| DotNotation<U, `${TPrefix}`, [...TDepth, 1]> // posts.title
			: T extends object
				? {
					[K in keyof T & string]:
						| `${TPrefix}${K}`
						| DotNotation<T[K], `${TPrefix}${K}.`, [...TDepth, 1]>
				}[keyof T & string]
				: never;

/** Resolves a dot-notated path to the corresponding type, including array indexing */
export type DotPathValue<T, TPath extends string, TDepth extends number[] = []> =
  T extends unknown
		?
			TDepth['length'] extends 9
			? never
			: TPath extends `${infer Key}.${infer Rest}`
				? Key extends keyof T
					? DotPathValue<NonNullable<T[Key]>, Rest, [...TDepth, 1]>
					: T extends readonly (infer U)[]
						? Key extends `${number}`
							? DotPathValue<U, Rest, [...TDepth, 1]>
							: DotPathValue<U, `${Key}.${Rest}`, [...TDepth, 1]>
						: never
				: TPath extends keyof T
					? T[TPath]
					: T extends readonly (infer U)[]
						? TPath extends `${number}`
							? U
							: DotPathValue<U, TPath, [...TDepth, 1]>
						: never
	: never;

export type OnlyFieldsOfTypeDotNotation<
	T,
	TFieldType,
	TAssignableType = TFieldType
> = {
	[P in DotNotation<T> as DotPathValue<T, P> extends TFieldType ? P : never]?: TAssignableType;
};
