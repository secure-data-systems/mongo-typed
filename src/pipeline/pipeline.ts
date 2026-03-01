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
	ProjectOutput,
	ProjectSpec,
	SetWindowFieldsSpec,
	SortSpec,
	UnwindOptions,
	UnwindOutput
} from './stages.js';

/** Enriches the builder return type with TTerminal methods when TTerminal is non-void. */
type Chain<TInput extends object, TTerminal> =
	TTerminal extends void
		? PipelineBuilder<TInput, TTerminal>
		: PipelineBuilder<TInput, TTerminal> & TTerminal;

/** Inferred output type of a $facet stage — each key maps to an array of the sub-pipeline's output type. */
export type FacetOutput<TSpec> = {
	[K in keyof TSpec]: TSpec[K] extends PipelineBuilder<infer O, any> ? O[] : unknown[]
};

// ---------------------------------------------------------------------------
// PipelineBuilder — fluent builder with schema tracking across stages
// ---------------------------------------------------------------------------

/** Terminal interface for {@link Pipeline} — provides `build()` to extract the raw stage array. */
export interface PipelineTerminal {
	build: () => object[]
}

/**
 * Creates a type-safe MongoDB aggregation pipeline.
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
export function pipeline<TInput extends object>(): Pipeline<TInput> {
	return new Pipeline<TInput>();
}

export class PipelineBuilder<TInput extends object, TTerminal = void> {
	protected readonly stages: object[];

	constructor(stages: object[] = []) {
		this.stages = stages;
	}

	addFields<TFields extends AddFieldsSpec<TInput>>(spec: TFields): Chain<TInput & AddFieldsOutput<TInput, TFields>, TTerminal> {
		return this.push({ $addFields: spec });
	}

	count<TField extends string>(field: TField): Chain<Record<TField, number>, TTerminal> {
		return this.push({ $count: field });
	}

	/** Override in subclasses to control how new builder instances are created during chaining. */
	protected create<T extends object>(stages: object[]): PipelineBuilder<T, TTerminal> {
		return new PipelineBuilder<T, TTerminal>(stages);
	}

	facet<TSpec extends Record<string, PipelineBuilder<any, any>>>(fn: (p: () => PipelineBuilder<TInput, TTerminal>) => TSpec): Chain<FacetOutput<TSpec>, TTerminal> {
		const spec = fn(() => this.create<TInput>([]));
		const built = Object.fromEntries(Object.entries(spec).map(([k, b]) => [k, [...b.stages]]));
		return this.push({ $facet: built });
	}

	group<TSpec extends GroupSpec<TInput>>(spec: TSpec): Chain<GroupOutput<TInput, TSpec>, TTerminal> {
		return this.push({ $group: spec });
	}

	limit(n: number): Chain<TInput, TTerminal> {
		return this.push({ $limit: n });
	}

	lookup<TForeignSchema extends object, TAs extends string>(
		spec: LookupSpec<TInput, TForeignSchema, TAs>
	): Chain<TInput & Record<TAs, TForeignSchema[]>, TTerminal> {
		return this.push({ $lookup: spec });
	}

	match(filter: Filter<TInput>): Chain<TInput, TTerminal> {
		return this.push({ $match: filter });
	}

	merge(spec: MergeSpec): TTerminal {
		return this.create([...this.stages, { $merge: spec }]) as unknown as TTerminal;
	}

	out(collection: string | { coll: string, db: string }): TTerminal {
		return this.create([...this.stages, { $out: collection }]) as unknown as TTerminal;
	}

	project<TSpec extends ProjectSpec<TInput>>(spec: TSpec): Chain<ProjectOutput<TInput, TSpec>, TTerminal> {
		return this.push({ $project: spec });
	}

	private push(stage: object): any {
		return this.create([...this.stages, stage]);
	}

	replaceRoot<TOutput extends object = Record<string, unknown>>(spec: { newRoot: Expr<TInput> }): Chain<TOutput, TTerminal> {
		return this.push({ $replaceRoot: spec });
	}

	replaceWith<TOutput extends object = Record<string, unknown>>(expr: Expr<TInput>): Chain<TOutput, TTerminal> {
		return this.push({ $replaceWith: expr });
	}

	sample(spec: { size: number }): Chain<TInput, TTerminal> {
		return this.push({ $sample: spec });
	}

	set<TFields extends AddFieldsSpec<TInput>>(spec: TFields): Chain<TInput & AddFieldsOutput<TInput, TFields>, TTerminal> {
		return this.push({ $set: spec });
	}

	setWindowFields(spec: SetWindowFieldsSpec<TInput>): Chain<TInput, TTerminal> {
		return this.push({ $setWindowFields: spec });
	}

	skip(n: number): Chain<TInput, TTerminal> {
		return this.push({ $skip: n });
	}

	sort(spec: SortSpec<TInput>): Chain<TInput, TTerminal> {
		return this.push({ $sort: spec });
	}

	sortByCount<TExpr extends Expr<TInput>>(expr: TExpr): Chain<{ _id: InferExprType<TInput, TExpr>, count: number }, TTerminal> {
		return this.push({ $sortByCount: expr });
	}

	unset<T extends DotNotation<TInput>>(fields: T | T[]): Chain<Omit<TInput, T>, TTerminal> {
		return this.push({ $unset: fields });
	}

	unwind<TField extends FieldRef<TInput>>(
		spec: TField | UnwindOptions<TInput, TField>
	): Chain<UnwindOutput<TInput, TField>, TTerminal> {
		return this.push({ $unwind: spec });
	}
}

/** Concrete pipeline builder with `build()` to extract the raw stage array. */
export class Pipeline<TInput extends object> extends PipelineBuilder<TInput, PipelineTerminal> implements PipelineTerminal {
	build(): object[] {
		return [...this.stages];
	}

	protected override create<T extends object>(stages: object[]): Pipeline<T> {
		return new Pipeline<T>(stages);
	}
}
