import { DotNotation } from './dot-notation.js';
import { Expr, FieldRef, InferExprType, NumericExpr } from './expr.js';
import { Filter } from './filter.js';
import { GeoJsonPoint } from './geo-json.js';

// ---------------------------------------------------------------------------
// Accumulator expressions (valid in $group, $bucket, $bucketAuto, $setWindowFields)
// ---------------------------------------------------------------------------

export type AccumulatorExpr<TInput extends object> =
	| { $addToSet: Expr<TInput> }
	| { $avg: Expr<TInput> | Expr<TInput>[] }
	| { $bottom: { output: Expr<TInput>, sortBy: Record<string, -1 | 1> } }
	| { $bottomN: { n: NumericExpr<TInput>, output: Expr<TInput>, sortBy: Record<string, -1 | 1> } }
	| { $count: Record<string, never> }
	| { $first: Expr<TInput> }
	| { $firstN: { input: Expr<TInput>, n: NumericExpr<TInput> } }
	| { $last: Expr<TInput> }
	| { $lastN: { input: Expr<TInput>, n: NumericExpr<TInput> } }
	| { $max: Expr<TInput> | Expr<TInput>[] }
	| { $maxN: { input: Expr<TInput>, n: NumericExpr<TInput> } }
	| { $mergeObjects: Expr<TInput> }
	| { $min: Expr<TInput> | Expr<TInput>[] }
	| { $minN: { input: Expr<TInput>, n: NumericExpr<TInput> } }
	| { $push: Expr<TInput> }
	| { $stdDevPop: Expr<TInput> | Expr<TInput>[] }
	| { $stdDevSamp: Expr<TInput> | Expr<TInput>[] }
	| { $sum: Expr<TInput> | Expr<TInput>[] }
	| { $top: { output: Expr<TInput>, sortBy: Record<string, -1 | 1> } }
	| { $topN: { n: NumericExpr<TInput>, output: Expr<TInput>, sortBy: Record<string, -1 | 1> } };

/** Inferred output type of an $addFields / $set stage — maps each spec key to its expression return type. */
export type AddFieldsOutput<TInput extends object, TFields extends AddFieldsSpec<TInput>> = {
	[K in keyof TFields]: InferExprType<TInput, TFields[K]>
};

/** Fields to add or overwrite via $addFields / $set */
export type AddFieldsSpec<TInput extends object> = Record<string, Expr<TInput>>;

// ---------------------------------------------------------------------------
// Stage-specific spec types
// ---------------------------------------------------------------------------

/** Spec for $bucketAuto */
export interface BucketAutoSpec<TInput extends object> {
	buckets: number,
	granularity?: string,
	groupBy: Expr<TInput>,
	output?: Record<string, AccumulatorExpr<TInput>>
}

/** Spec for $bucket */
export interface BucketSpec<TInput extends object> {
	boundaries: unknown[],
	default?: number | string,
	groupBy: Expr<TInput>,
	output?: Record<string, AccumulatorExpr<TInput>>
}

/** Spec for $densify */
export interface DensifySpec<TInput extends object> {
	field: DotNotation<TInput>,
	partitionByFields?: DotNotation<TInput>[],
	range: {
		bounds: 'full' | 'partition' | [Date | number, Date | number],
		step: number,
		unit?: 'day' | 'hour' | 'millisecond' | 'minute' | 'month' | 'quarter' | 'second' | 'week' | 'year'
	}
}

/** @internal Merges all dot-notation inclusion paths in a $project spec into a nested object type. */
type DotNotationInclusionMerge<TInput extends object, TSpec> =
	[DotPathsUnion<TInput, TSpec>] extends [never] ? unknown : UnionToIntersection<DotPathsUnion<TInput, TSpec>>;

/** @internal Union of PathToNested results for all non-excluded dot-notation fields in TSpec. */
type DotPathsUnion<TInput extends object, TSpec> = {
	[K in keyof TSpec & string]: K extends `${string}.${string}` ? TSpec[K] extends 0 | false ? never : PathToNested<TInput, K> : never
}[keyof TSpec & string];

/** Inferred output type of a $facet stage — each key maps to an array of the sub-pipeline's output type. */
export type FacetOutput<TSpec> = {
	[K in keyof TSpec]: TSpec[K] extends PipelineBuilder<infer O> ? O[] : unknown[]
};

/** Spec for $fill */
export interface FillSpec<TInput extends object> {
	output: {
		[K in keyof TInput]?: { method: 'backward' | 'forward' | 'linear' | 'locf' | 'spline' } | { value: Expr<TInput> }
	},
	partitionBy?: Record<string, Expr<TInput>>,
	partitionByFields?: DotNotation<TInput>[],
	sortBy?: SortSpec<TInput>
}

/** Spec for $geoNear */
export interface GeoNearSpec<TInput extends object> {
	distanceField: string,
	distanceMultiplier?: number,
	includeLocs?: string,
	key?: string,
	maxDistance?: number,
	minDistance?: number,
	near: [number, number] | GeoJsonPoint,
	query?: Filter<TInput>,
	spherical?: boolean
}

/** Spec for $graphLookup */
export interface GraphLookupSpec<TInput extends object> {
	as: string,
	connectFromField: string,
	connectToField: string,
	depthField?: string,
	from: string,
	maxDepth?: number,
	restrictSearchWithMatch?: Filter<TInput>,
	startWith: Expr<TInput>
}

/** @internal Infers the element type of an array-returning accumulator; never if not matched */
type GroupArrayAccumulatorElement<TInput extends object, TField> =
	TField extends { $addToSet: infer E } ? InferExprType<TInput, E>
		: TField extends { $bottomN: { n: any, output: infer E, sortBy: any } } ? InferExprType<TInput, E>
			: TField extends { $firstN: { input: infer E, n: any } } ? InferExprType<TInput, E>
				: TField extends { $lastN: { input: infer E, n: any } } ? InferExprType<TInput, E>
					: TField extends { $maxN: { input: infer E, n: any } } ? InferExprType<TInput, E>
						: TField extends { $minN: { input: infer E, n: any } } ? InferExprType<TInput, E>
							: TField extends { $push: infer E } ? InferExprType<TInput, E>
								: TField extends { $topN: { n: any, output: infer E, sortBy: any } } ? InferExprType<TInput, E>
									: never;

/**
 * Infers the output type of a single $group accumulator field.
 * Numeric accumulators → number; array accumulators infer element type and wrap in [];
 * scalar accumulators infer their expression type; fallthrough covers _id and raw expressions.
 */
type GroupFieldOutput<TInput extends object, TField> =
	[TField] extends [GroupNumericAccumulator] ? number
		: [GroupArrayAccumulatorElement<TInput, TField>] extends [never]
			? [GroupScalarAccumulatorOutput<TInput, TField>] extends [never]
				? InferExprType<TInput, TField>
				: GroupScalarAccumulatorOutput<TInput, TField>
			: GroupArrayAccumulatorElement<TInput, TField>[];

/** @internal Numeric accumulator shapes — always produce number */
type GroupNumericAccumulator =
	| { $avg: any }
	| { $count: any }
	| { $stdDevPop: any }
	| { $stdDevSamp: any }
	| { $sum: any };

/** Infers the output document type of a $group stage from its spec. */
export type GroupOutput<TInput extends object, TSpec extends GroupSpec<TInput>> = {
	[K in keyof TSpec]: TSpec[K] extends null ? null : GroupFieldOutput<TInput, TSpec[K]>
};

/** @internal Infers the scalar return type of expression-forwarding non-array accumulators; never if not matched */
type GroupScalarAccumulatorOutput<TInput extends object, TField> =
	TField extends { $bottom: { output: infer E, sortBy: any } } ? InferExprType<TInput, E>
		: TField extends { $first: infer E } ? InferExprType<TInput, E>
			: TField extends { $last: infer E } ? InferExprType<TInput, E>
				: TField extends { $max: infer E } ? InferExprType<TInput, E>
					: TField extends { $mergeObjects: infer E } ? InferExprType<TInput, E>
						: TField extends { $min: infer E } ? InferExprType<TInput, E>
							: TField extends { $top: { output: infer E, sortBy: any } } ? InferExprType<TInput, E>
								: never;

/**
 * Spec for $group.
 * `_id` is required (use `null` for global grouping).
 * All other fields must be accumulator expressions.
 */
export type GroupSpec<TInput extends object> = {
	_id: Expr<TInput> | null
} & {
	[field: string]: AccumulatorExpr<TInput> | Expr<TInput> | null
};

/** True if TSpec has any field with value `1 | true` — signals $project inclusion mode. */
type HasInclusion<TSpec> =
	[{ [K in keyof TSpec]: TSpec[K] extends 1 | true ? true : never }[keyof TSpec]] extends [never] ? false : true;

/** Spec for $lookup — equality join or pipeline join */
export type LookupSpec<TInput extends object, TForeignSchema extends object, TAs extends string> =
	| {
		as: TAs,
		foreignField: DotNotation<TForeignSchema>,
		from: string,
		localField: DotNotation<TInput>
	}
	| {
		as: TAs,
		from: string,
		let?: Record<string, Expr<TInput>>,
		pipeline: PipelineStage<TForeignSchema>[]
	};

/** Spec for $merge */
export interface MergeSpec {
	into: string | { coll: string, db: string },
	let?: Record<string, string>,
	on?: string | string[],
	whenMatched?: 'fail' | 'keepExisting' | 'merge' | 'replace' | PipelineStage<any>[],
	whenNotMatched?: 'discard' | 'fail' | 'insert'
}

/** @internal Builds a nested object type from a dot-notation path, preserving array wrappers at intermediate array fields. */
type PathToNested<TInput extends object, TPath extends string> =
	TPath extends `${infer Head}.${infer Rest}`
		? Head extends keyof TInput
			? NonNullable<TInput[Head]> extends readonly (infer U)[]
				? { [K in Head]: Array<U extends object ? PathToNested<U, Rest> : unknown> }
				: NonNullable<TInput[Head]> extends object
					? { [K in Head]: PathToNested<NonNullable<TInput[Head]>, Rest> }
					: { [K in Head]: unknown }
			: { [K in Head]: unknown }
		: TPath extends keyof TInput
			? { [K in TPath]: TInput[TPath] }
			: { [K in TPath]: unknown };

export interface PipelineBuilder<TInput extends object> {
	/**
	 * Adds computed fields to each document.
	 * The output schema is extended with the keys from `spec`, each typed
	 * via the inferred expression return type.
	 */
	addFields<TFields extends AddFieldsSpec<TInput>>(
		spec: TFields
	): PipelineBuilder<TInput & AddFieldsOutput<TInput, TFields>>,

	/** Terminates the builder and returns the accumulated stage array. */
	build(): PipelineStage<any>[],

	/** Counts documents and outputs `{ [field]: number }`. */
	count<TField extends string>(field: TField): PipelineBuilder<Record<TField, number>>,

	/**
	 * Runs multiple sub-pipelines on the same input and merges their results.
	 * Pass a factory callback that receives `p` — call `p()` to get a fresh
	 * `PipelineBuilder<TInput>` for each sub-pipeline.
	 * @example
	 * ```ts
	 * pipeline<User>().facet(p => ({
	 *   byDept: p().group({ _id: '$department', count: { $sum: 1 } }),
	 *   top10:  p().sort({ score: -1 }).limit(10),
	 * }))
	 * ```
	 */
	facet<TSpec extends Record<string, PipelineBuilder<any>>>(fn: (p: () => PipelineBuilder<TInput>) => TSpec): PipelineBuilder<FacetOutput<TSpec>>,

	/**
	 * Groups documents by `_id` and computes accumulator fields.
	 * Output types are fully inferred: numeric accumulators → `number`,
	 * array accumulators → typed element arrays, scalar accumulators and
	 * `_id` → inferred expression return type.
	 */
	group<TSpec extends GroupSpec<TInput>>(spec: TSpec): PipelineBuilder<GroupOutput<TInput, TSpec>>,

	/** Limits the result to `n` documents. */
	limit(n: number): PipelineBuilder<TInput>,

	/**
	 * Joins documents from another collection.
	 * The output schema is extended with `TAs` typed as `TForeignSchema[]`.
	 */
	lookup<TForeignSchema extends object, TAs extends string>(
		spec: LookupSpec<TInput, TForeignSchema, TAs>
	): PipelineBuilder<TInput & Record<TAs, TForeignSchema[]>>,

	/** Filters documents using a query filter. */
	match(filter: Filter<TInput>): PipelineBuilder<TInput>,

	/**
	 * Terminates the builder by adding a `$merge` stage and returning the stage array.
	 */
	merge(spec: MergeSpec): PipelineStage<any>[],

	/**
	 * Terminates the builder by adding a `$out` stage and returning the stage array.
	 */
	out(collection: string | { coll: string, db: string }): PipelineStage<any>[],

	/**
	 * Reshapes each document.
	 * - **Inclusion mode** (any field = `1 | true`): only spec'd fields are kept;
	 *   `1 | true` fields carry their `TInput` type; expression fields are typed
	 *   via inferred return type; `0 | false` fields and dot-notation keys are handled.
	 * - **Exclusion mode** (no field = `1 | true`): `TInput` minus excluded fields;
	 *   expression fields are typed via inferred return type.
	 */
	project<TSpec extends ProjectSpec<TInput>>(spec: TSpec): PipelineBuilder<ProjectOutput<TInput, TSpec>>,

	/**
	 * Replaces each document with a new root expression.
	 * Specify `TOutput` explicitly to track the output schema downstream.
	 */
	replaceRoot<TOutput extends object = Record<string, unknown>>(
		spec: { newRoot: Expr<TInput> }
	): PipelineBuilder<TOutput>,

	/**
	 * Replaces each document with an expression result.
	 * Specify `TOutput` explicitly to track the output schema downstream.
	 */
	replaceWith<TOutput extends object = Record<string, unknown>>(
		expr: Expr<TInput>
	): PipelineBuilder<TOutput>,

	/** Returns a random sample of `size` documents. */
	sample(spec: { size: number }): PipelineBuilder<TInput>,

	/**
	 * Adds or overwrites fields (alias for `addFields`).
	 * The output schema is extended with the keys from `spec`, each typed
	 * via the inferred expression return type.
	 */
	set<TFields extends AddFieldsSpec<TInput>>(
		spec: TFields
	): PipelineBuilder<TInput & AddFieldsOutput<TInput, TFields>>,

	/**
	 * Computes window aggregations over sorted/partitioned documents.
	 * Use explicit stage via `build()` to control output schema.
	 */
	setWindowFields(spec: SetWindowFieldsSpec<TInput>): PipelineBuilder<TInput>,

	/** Skips the first `n` documents. */
	skip(n: number): PipelineBuilder<TInput>,

	/** Sorts documents by the given field paths. */
	sort(spec: SortSpec<TInput>): PipelineBuilder<TInput>,

	/** Groups documents by an expression and counts occurrences, sorted descending by count. */
	sortByCount<TExpr extends Expr<TInput>>(expr: TExpr): PipelineBuilder<{ _id: InferExprType<TInput, TExpr>, count: number }>,

	/**
	 * Removes fields from each document.
	 * The output schema omits the specified key(s).
	 */
	unset<T extends DotNotation<TInput>>(fields: T | T[]): PipelineBuilder<Omit<TInput, T>>,

	/**
	 * Deconstructs an array field, emitting one document per element.
	 * The output type unwraps the array field to its element type.
	 */
	unwind<TField extends FieldRef<TInput>>(
		spec: TField | UnwindOptions<TInput, TField>
	): PipelineBuilder<UnwindOutput<TInput, TField>>
}

export type PipelineStage<TInput extends object> =
	| { $addFields: AddFieldsSpec<TInput> }
	| { $bucket: BucketSpec<TInput> }
	| { $bucketAuto: BucketAutoSpec<TInput> }
	| { $count: string }
	| { $densify: DensifySpec<TInput> }
	| { $documents: Expr<TInput>[] }
	| { $facet: Record<string, PipelineStage<TInput>[]> }
	| { $fill: FillSpec<TInput> }
	| { $geoNear: GeoNearSpec<TInput> }
	| { $graphLookup: GraphLookupSpec<TInput> }
	| { $group: GroupSpec<TInput> }
	| { $indexStats: Record<string, never> }
	| { $limit: number }
	| { $lookup: LookupSpec<TInput, any, string> }
	| { $match: Filter<TInput> }
	| { $merge: MergeSpec }
	| { $out: string | { coll: string, db: string } }
	| { $project: ProjectSpec<TInput> }
	| { $replaceRoot: { newRoot: Expr<TInput> } }
	| { $replaceWith: Expr<TInput> }
	| { $sample: { size: number } }
	| { $set: AddFieldsSpec<TInput> }
	| { $setWindowFields: SetWindowFieldsSpec<TInput> }
	| { $skip: number }
	| { $sort: SortSpec<TInput> }
	| { $sortByCount: Expr<TInput> }
	| { $unionWith: string | { coll: string, pipeline?: PipelineStage<any>[] } }
	| { $unset: DotNotation<TInput> | DotNotation<TInput>[] }
	| { $unwind: FieldRef<TInput> | UnwindOptions<TInput, FieldRef<TInput>> };

/** @internal Exclusion-mode $project output: TInput minus excluded fields; expression fields are typed via InferExprType. */
type ProjectExclusionOutput<TInput extends object, TSpec> =
	{ [K in keyof TInput as K extends keyof TSpec ? TSpec[K] extends 0 | false ? never : TSpec[K] extends 1 | boolean | true ? K : never : K]: TInput[K] }
	& { [K in keyof TSpec as TSpec[K] extends 0 | 1 | boolean | false | true ? never : K]: InferExprType<TInput, TSpec[K]> };

/** @internal Inclusion-mode $project output: top-level fields typed from TInput, dot-notation paths reconstructed as nested objects. */
type ProjectInclusionOutput<TInput extends object, TSpec> =
	{ [K in keyof TSpec & string as TSpec[K] extends 0 | false ? never : K extends `${string}.${string}` ? never : K]: TSpec[K] extends 1 | true ? (K extends keyof TInput ? TInput[K] : unknown) : InferExprType<TInput, TSpec[K]> }
	& DotNotationInclusionMerge<TInput, TSpec>;

/**
 * Inferred output type of a `$project` stage.
 *
 * - **Inclusion mode** (any field = `1 | true`): only spec'd fields are kept.
 *   Fields with `1 | true` carry their original `TInput` type; expression
 *   fields are typed via `InferExprType`; `0 | false` fields are dropped;
 *   dot-notation keys are reconstructed as nested object types.
 * - **Exclusion mode** (no field = `1 | true`): `TInput` minus excluded fields.
 *   Expression fields are typed via `InferExprType`.
 */
export type ProjectOutput<TInput extends object, TSpec extends ProjectSpec<TInput>> =
	HasInclusion<TSpec> extends true ? ProjectInclusionOutput<TInput, TSpec> : ProjectExclusionOutput<TInput, TSpec>;

/** Projection spec for $project (field inclusion/exclusion and computed fields) */
export type ProjectSpec<TInput extends object> = {
	_id?: 0 | 1 | boolean
} & {
	[P in DotNotation<TInput>]?: 0 | 1 | boolean | (Expr<TInput> & (object | string))
} & {
	[field: string]: 0 | 1 | boolean | (Expr<TInput> & (object | string)) | undefined
};

/** Spec for $setWindowFields */
export interface SetWindowFieldsSpec<TInput extends object> {
	output: Record<string, WindowAccumulatorExpr<TInput>>,
	partitionBy?: Expr<TInput>,
	sortBy?: SortSpec<TInput>
}

/** Sort specification: field paths mapped to sort direction or $meta */
export type SortSpec<TInput extends object> = {
	[K in DotNotation<TInput>]?: -1 | 1 | { $meta: string }
};

/** @internal Converts a union type to an intersection type. Used to merge nested projection paths. */
type UnionToIntersection<U> =
	(U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

/** Options object form of $unwind */
export interface UnwindOptions<TInput extends object, TField extends FieldRef<TInput>> {
	includeArrayIndex?: string,
	path: TField,
	preserveNullAndEmptyArrays?: boolean
}

/**
 * Infers the output type of an $unwind stage.
 * Array fields are unwrapped to their element type; non-array fields are unchanged.
 */
export type UnwindOutput<TInput extends object, TField extends FieldRef<TInput>> =
	TField extends `$${infer K}`
		? K extends keyof TInput
			? Omit<TInput, K> & { [P in K]: NonNullable<TInput[K]> extends ReadonlyArray<infer U> ? U : TInput[K] }
			: TInput
		: TInput;

// ---------------------------------------------------------------------------
// PipelineBuilder — fluent builder with schema tracking across stages
// ---------------------------------------------------------------------------

/** Accumulator expression with an optional window specification, for use in `$setWindowFields`. */
export type WindowAccumulatorExpr<TInput extends object> = AccumulatorExpr<TInput> & {
	window?: {
		documents?: ['current' | 'unbounded' | number, 'current' | 'unbounded' | number],
		range?: ['current' | 'unbounded' | number, 'current' | 'unbounded' | number],
		unit?: 'day' | 'hour' | 'millisecond' | 'minute' | 'month' | 'quarter' | 'second' | 'week' | 'year'
	}
};

// ---------------------------------------------------------------------------
// Runtime implementation
// ---------------------------------------------------------------------------

/**
 * Creates a type-safe MongoDB aggregation pipeline builder.
 * The generic parameter `TInput` is the schema of the collection being aggregated.
 *
 * @example
 * ```ts
 * const stages = pipeline<User>()
 *   .match({ active: true })
 *   .group({ _id: '$department', headcount: { $sum: 1 } })
 *   .sort({ headcount: -1 })
 *   .build();
 * ```
 */
export function pipeline<TInput extends object>(): PipelineBuilder<TInput> {
	return new PipelineBuilderImpl<TInput>();
}

class PipelineBuilderImpl<TInput extends object> implements PipelineBuilder<TInput> {
	private readonly _stages: object[];

	constructor(stages: object[] = []) {
		this._stages = stages;
	}

	addFields<TFields extends AddFieldsSpec<TInput>>(spec: TFields): PipelineBuilder<TInput & AddFieldsOutput<TInput, TFields>> {
		return this.push({ $addFields: spec });
	}

	build(): PipelineStage<any>[] {
		return [...this._stages] as PipelineStage<any>[];
	}

	count<TField extends string>(field: TField): PipelineBuilder<Record<TField, number>> {
		return this.push({ $count: field });
	}

	facet<TSpec extends Record<string, PipelineBuilder<any>>>(fn: (p: () => PipelineBuilder<TInput>) => TSpec): PipelineBuilder<FacetOutput<TSpec>> {
		const spec = fn(() => new PipelineBuilderImpl<TInput>([]));
		const built = Object.fromEntries(Object.entries(spec).map(([k, b]) => [k, b.build()]));
		return this.push({ $facet: built }) as PipelineBuilder<FacetOutput<TSpec>>;
	}

	group<TSpec extends GroupSpec<TInput>>(spec: TSpec): PipelineBuilder<GroupOutput<TInput, TSpec>> {
		return this.push({ $group: spec });
	}

	limit(n: number): PipelineBuilder<TInput> {
		return this.push({ $limit: n });
	}

	lookup<TForeignSchema extends object, TAs extends string>(
		spec: LookupSpec<TInput, TForeignSchema, TAs>
	): PipelineBuilder<TInput & Record<TAs, TForeignSchema[]>> {
		return this.push({ $lookup: spec });
	}

	match(filter: Filter<TInput>): PipelineBuilder<TInput> {
		return this.push({ $match: filter });
	}

	merge(spec: MergeSpec): PipelineStage<any>[] {
		return [...this._stages, { $merge: spec }] as PipelineStage<any>[];
	}

	out(collection: string | { coll: string, db: string }): PipelineStage<any>[] {
		return [...this._stages, { $out: collection }] as PipelineStage<any>[];
	}

	project<TSpec extends ProjectSpec<TInput>>(spec: TSpec): PipelineBuilder<ProjectOutput<TInput, TSpec>> {
		return this.push({ $project: spec });
	}

	private push(stage: object): PipelineBuilderImpl<any> {
		return new PipelineBuilderImpl<any>([...this._stages, stage]);
	}

	replaceRoot<TOutput extends object = Record<string, unknown>>(spec: { newRoot: Expr<TInput> }): PipelineBuilder<TOutput> {
		return this.push({ $replaceRoot: spec });
	}

	replaceWith<TOutput extends object = Record<string, unknown>>(expr: Expr<TInput>): PipelineBuilder<TOutput> {
		return this.push({ $replaceWith: expr });
	}

	sample(spec: { size: number }): PipelineBuilder<TInput> {
		return this.push({ $sample: spec });
	}

	set<TFields extends AddFieldsSpec<TInput>>(spec: TFields): PipelineBuilder<TInput & AddFieldsOutput<TInput, TFields>> {
		return this.push({ $set: spec });
	}

	setWindowFields(spec: SetWindowFieldsSpec<TInput>): PipelineBuilder<TInput> {
		return this.push({ $setWindowFields: spec });
	}

	skip(n: number): PipelineBuilder<TInput> {
		return this.push({ $skip: n });
	}

	sort(spec: SortSpec<TInput>): PipelineBuilder<TInput> {
		return this.push({ $sort: spec });
	}

	sortByCount<TExpr extends Expr<TInput>>(expr: TExpr): PipelineBuilder<{ _id: InferExprType<TInput, TExpr>, count: number }> {
		return this.push({ $sortByCount: expr });
	}

	unset<T extends DotNotation<TInput>>(fields: T | T[]): PipelineBuilder<Omit<TInput, T>> {
		return this.push({ $unset: fields });
	}

	unwind<TField extends FieldRef<TInput>>(
		spec: TField | UnwindOptions<TInput, TField>
	): PipelineBuilder<UnwindOutput<TInput, TField>> {
		return this.push({ $unwind: spec });
	}
}
