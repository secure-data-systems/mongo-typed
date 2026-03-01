import { DotNotation } from '../dot-notation.js';
import { Expr } from '../expr.js';
import {
	AddFieldsOutput,
	AddFieldsSpec,
	ProjectOutput,
	ProjectSpec
} from './stages.js';

/** Enriches the builder return type with TTerminal methods when TTerminal is non-void. */
type Chain<TInput extends object, TTerminal> =
	TTerminal extends void
		? UpdatePipelineBuilder<TInput, TTerminal>
		: UpdatePipelineBuilder<TInput, TTerminal> & TTerminal;

/** Terminal interface for {@link UpdatePipeline} — provides `build()` to extract the raw stage array. */
export interface UpdatePipelineTerminal {
	build: () => object[]
}

/**
 * Creates a type-safe MongoDB update pipeline.
 * Only stages valid in update operations are available:
 * `$addFields`, `$set`, `$project`, `$unset`, `$replaceRoot`, `$replaceWith`.
 *
 * @example
 * ```ts
 * const stages = updatePipeline<User>()
 *   .set({ fullName: { $concat: ['$firstName', ' ', '$lastName'] } })
 *   .unset('tempField')
 *   .build();
 * ```
 */
export function updatePipeline<TInput extends object>(): UpdatePipeline<TInput> {
	return new UpdatePipeline<TInput>();
}

export class UpdatePipelineBuilder<TInput extends object, TTerminal = void> {
	protected readonly stages: object[];

	constructor(stages: object[] = []) {
		this.stages = stages;
	}

	addFields<TFields extends AddFieldsSpec<TInput>>(spec: TFields): Chain<TInput & AddFieldsOutput<TInput, TFields>, TTerminal> {
		return this.push({ $addFields: spec });
	}

	/** Override in subclasses to control how new builder instances are created during chaining. */
	protected create<T extends object>(stages: object[]): UpdatePipelineBuilder<T, TTerminal> {
		return new UpdatePipelineBuilder<T, TTerminal>(stages);
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

	set<TFields extends AddFieldsSpec<TInput>>(spec: TFields): Chain<TInput & AddFieldsOutput<TInput, TFields>, TTerminal> {
		return this.push({ $set: spec });
	}

	unset<T extends DotNotation<TInput>>(fields: T | T[]): Chain<Omit<TInput, T>, TTerminal> {
		return this.push({ $unset: fields });
	}
}

/** Concrete update pipeline builder with `build()` to extract the raw stage array. */
export class UpdatePipeline<TInput extends object> extends UpdatePipelineBuilder<TInput, UpdatePipelineTerminal> implements UpdatePipelineTerminal {
	build(): object[] {
		return [...this.stages];
	}

	protected override create<T extends object>(stages: object[]): UpdatePipeline<T> {
		return new UpdatePipeline<T>(stages);
	}
}
