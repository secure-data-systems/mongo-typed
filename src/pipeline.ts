import { DotNotation } from './dot-notation.js';
import { Expr, FieldRef, NumericExpr } from './expr.js';
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

/**
 * Infers the output type of a single $group accumulator field.
 * Numeric accumulators → number, array accumulators → unknown[], others → unknown.
 */
type GroupFieldOutput<TField> =
	TField extends { $avg: any } ? number
		: TField extends { $count: any } ? number
			: TField extends { $stdDevPop: any } ? number
				: TField extends { $stdDevSamp: any } ? number
					: TField extends { $sum: any } ? number
						: TField extends { $addToSet: any } ? unknown[]
							: TField extends { $push: any } ? unknown[]
								: unknown;

/** Infers the output document type of a $group stage from its spec. */
export type GroupOutput<TInput extends object, TSpec extends GroupSpec<TInput>> = {
	[K in keyof TSpec]: TSpec[K] extends null ? null : GroupFieldOutput<TSpec[K]>
};

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

export interface PipelineBuilder<TInput extends object> {
	/**
	 * Adds computed fields to each document.
	 * The output schema is extended with the keys from `spec`.
	 */
	addFields<TFields extends AddFieldsSpec<TInput>>(
		spec: TFields
	): PipelineBuilder<TInput & Record<keyof TFields, unknown>>,

	/** Terminates the builder and returns the accumulated stage array. */
	build(): PipelineStage<any>[],

	/** Counts documents and outputs `{ [field]: number }`. */
	count<TField extends string>(field: TField): PipelineBuilder<Record<TField, number>>,

	/**
	 * Runs multiple sub-pipelines on the same input and merges their results.
	 * The output schema is `Record<string, unknown[]>`.
	 */
	facet(spec: Record<string, PipelineStage<TInput>[]>): PipelineBuilder<Record<string, unknown[]>>,

	/**
	 * Groups documents by `_id` and computes accumulator fields.
	 * The output type is inferred from the spec for numeric/array accumulators.
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
	 * Specify `TOutput` explicitly to track the output schema downstream.
	 */
	project<TOutput extends object = Record<string, unknown>>(
		spec: ProjectSpec<TInput>
	): PipelineBuilder<TOutput>,

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
	 * The output schema is extended with the keys from `spec`.
	 */
	set<TFields extends AddFieldsSpec<TInput>>(
		spec: TFields
	): PipelineBuilder<TInput & Record<keyof TFields, unknown>>,

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
	sortByCount(expr: Expr<TInput>): PipelineBuilder<{ _id: unknown, count: number }>,

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

/** Projection spec for $project (field inclusion/exclusion and computed fields) */
export type ProjectSpec<TInput extends object> = {
	_id?: 0 | 1 | boolean
} & {
	[P in keyof TInput]?: 0 | 1 | boolean | Expr<TInput>
} & {
	[field: string]: 0 | 1 | boolean | Expr<TInput> | undefined
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

/** Options object form of $unwind */
export interface UnwindOptions<TInput extends object, TField extends FieldRef<TInput>> {
	includeArrayIndex?: string,
	path: TField,
	preserveNullAndEmptyArrays?: boolean
}

// ---------------------------------------------------------------------------
// PipelineStage — the flat union of all valid stage objects
// ---------------------------------------------------------------------------

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

// Window accumulator (AccumulatorExpr with optional window specification)
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

	addFields<TFields extends AddFieldsSpec<TInput>>(spec: TFields): PipelineBuilder<TInput & Record<keyof TFields, unknown>> {
		return this.push({ $addFields: spec }) as PipelineBuilder<TInput & Record<keyof TFields, unknown>>;
	}

	build(): PipelineStage<any>[] {
		return [...this._stages] as PipelineStage<any>[];
	}

	count<TField extends string>(field: TField): PipelineBuilder<Record<TField, number>> {
		return this.push({ $count: field }) as PipelineBuilder<Record<TField, number>>;
	}

	facet(spec: Record<string, PipelineStage<TInput>[]>): PipelineBuilder<Record<string, unknown[]>> {
		return this.push({ $facet: spec }) as PipelineBuilder<Record<string, unknown[]>>;
	}

	group<TSpec extends GroupSpec<TInput>>(spec: TSpec): PipelineBuilder<GroupOutput<TInput, TSpec>> {
		return this.push({ $group: spec }) as PipelineBuilder<GroupOutput<TInput, TSpec>>;
	}

	limit(n: number): PipelineBuilder<TInput> {
		return this.push({ $limit: n }) as PipelineBuilder<TInput>;
	}

	lookup<TForeignSchema extends object, TAs extends string>(
		spec: LookupSpec<TInput, TForeignSchema, TAs>
	): PipelineBuilder<TInput & Record<TAs, TForeignSchema[]>> {
		return this.push({ $lookup: spec }) as PipelineBuilder<TInput & Record<TAs, TForeignSchema[]>>;
	}

	match(filter: Filter<TInput>): PipelineBuilder<TInput> {
		return this.push({ $match: filter }) as PipelineBuilder<TInput>;
	}

	merge(spec: MergeSpec): PipelineStage<any>[] {
		return [...this._stages, { $merge: spec }] as PipelineStage<any>[];
	}

	out(collection: string | { coll: string, db: string }): PipelineStage<any>[] {
		return [...this._stages, { $out: collection }] as PipelineStage<any>[];
	}

	project<TOutput extends object = Record<string, unknown>>(spec: ProjectSpec<TInput>): PipelineBuilder<TOutput> {
		return this.push({ $project: spec }) as PipelineBuilder<TOutput>;
	}

	private push(stage: object): PipelineBuilderImpl<any> {
		return new PipelineBuilderImpl<any>([...this._stages, stage]);
	}

	replaceRoot<TOutput extends object = Record<string, unknown>>(spec: { newRoot: Expr<TInput> }): PipelineBuilder<TOutput> {
		return this.push({ $replaceRoot: spec }) as PipelineBuilder<TOutput>;
	}

	replaceWith<TOutput extends object = Record<string, unknown>>(expr: Expr<TInput>): PipelineBuilder<TOutput> {
		return this.push({ $replaceWith: expr }) as PipelineBuilder<TOutput>;
	}

	sample(spec: { size: number }): PipelineBuilder<TInput> {
		return this.push({ $sample: spec }) as PipelineBuilder<TInput>;
	}

	set<TFields extends AddFieldsSpec<TInput>>(spec: TFields): PipelineBuilder<TInput & Record<keyof TFields, unknown>> {
		return this.push({ $set: spec }) as PipelineBuilder<TInput & Record<keyof TFields, unknown>>;
	}

	setWindowFields(spec: SetWindowFieldsSpec<TInput>): PipelineBuilder<TInput> {
		return this.push({ $setWindowFields: spec }) as PipelineBuilder<TInput>;
	}

	skip(n: number): PipelineBuilder<TInput> {
		return this.push({ $skip: n }) as PipelineBuilder<TInput>;
	}

	sort(spec: SortSpec<TInput>): PipelineBuilder<TInput> {
		return this.push({ $sort: spec }) as PipelineBuilder<TInput>;
	}

	sortByCount(expr: Expr<TInput>): PipelineBuilder<{ _id: unknown, count: number }> {
		return this.push({ $sortByCount: expr }) as PipelineBuilder<{ _id: unknown, count: number }>;
	}

	unset<T extends DotNotation<TInput>>(fields: T | T[]): PipelineBuilder<Omit<TInput, T>> {
		return this.push({ $unset: fields }) as PipelineBuilder<Omit<TInput, T>>;
	}

	unwind<TField extends FieldRef<TInput>>(
		spec: TField | UnwindOptions<TInput, TField>
	): PipelineBuilder<UnwindOutput<TInput, TField>> {
		return this.push({ $unwind: spec }) as PipelineBuilder<UnwindOutput<TInput, TField>>;
	}
}
