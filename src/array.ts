export type RewrapArray<TOriginal, TWrapped> =
	TOriginal extends (infer U)[]
		? RewrapArray<U, TWrapped>[]
		: TWrapped;

export type UnwrapArray<T> = T extends (infer U)[] ? UnwrapArray<U> : T;
