import { DotNotation } from '../dot-notation.js';
import { Expr, FieldRef, InferExprType } from '../expr.js';
import { Filter } from '../filter.js';
import {
	AddFieldsOutput,
	AddFieldsSpec,
	GroupOutput,
	GroupSpec,
	LookupSpec,
	MergeSpec,
	PipelineStage,
	ProjectOutput,
	ProjectSpec,
	SetWindowFieldsSpec,
	SortSpec,
	UnwindOptions,
	UnwindOutput
} from './stages.js';

/** Inferred output type of a $facet stage — each key maps to an array of the sub-pipeline's output type. */
export type FacetOutput<TSpec> = {
	[K in keyof TSpec]: TSpec[K] extends PipelineBuilder<infer O> ? O[] : unknown[]
};

// ---------------------------------------------------------------------------
// PipelineBuilder — fluent builder with schema tracking across stages
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
 *   .merge({ into: 'summary' });
 * ```
 */
export function pipeline<TInput extends object>(): PipelineBuilder<TInput> {
	return new PipelineBuilder<TInput>();
}

export class PipelineBuilder<TInput extends object> {
	protected readonly stages: object[];

	constructor(stages: object[] = []) {
		this.stages = stages;
	}

	addFields<TFields extends AddFieldsSpec<TInput>>(spec: TFields): PipelineBuilder<TInput & AddFieldsOutput<TInput, TFields>> {
		return this.push({ $addFields: spec });
	}

	count<TField extends string>(field: TField): PipelineBuilder<Record<TField, number>> {
		return this.push({ $count: field });
	}

	/** Override in subclasses to control how new builder instances are created during chaining. */
	protected create<T extends object>(stages: object[]): PipelineBuilder<T> {
		return new PipelineBuilder<T>(stages);
	}

	facet<TSpec extends Record<string, PipelineBuilder<any>>>(fn: (p: () => PipelineBuilder<TInput>) => TSpec): PipelineBuilder<FacetOutput<TSpec>> {
		const spec = fn(() => this.create<TInput>([]));
		const built = Object.fromEntries(Object.entries(spec).map(([k, b]) => [k, [...b.stages]]));
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
		return [...this.stages, { $merge: spec }] as PipelineStage<any>[];
	}

	out(collection: string | { coll: string, db: string }): PipelineStage<any>[] {
		return [...this.stages, { $out: collection }] as PipelineStage<any>[];
	}

	project<TSpec extends ProjectSpec<TInput>>(spec: TSpec): PipelineBuilder<ProjectOutput<TInput, TSpec>> {
		return this.push({ $project: spec });
	}

	private push(stage: object): PipelineBuilder<any> {
		return this.create([...this.stages, stage]);
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
