import {
	ProjectOutput,
	ProjectSpec,
	ValidateFieldRefs
} from '../pipeline/stages.js';

import { FindOptions } from './find.js';

/** Enriches the FindByIdBuilder return type with TTerminal methods. */
type FindByIdChain<TInput extends object, TOutput extends object, TTerminal> = FindByIdBuilder<TInput, TOutput, TTerminal> & TTerminal;

/**
 * Type-safe fluent builder for MongoDB findById queries.
 *
 * Only `select()` and `hint()` are available after construction.
 * Subclass and override `create()` plus terminal methods to connect
 * to a real MongoDB collection.
 */
export class FindByIdBuilder<TInput extends object, TOutput extends object = TInput, TTerminal = object> {
	protected readonly options: FindOptions;

	constructor(options: FindOptions = {}) {
		this.options = options;
	}

	/** Override in subclasses to control how new builder instances are created during chaining. */
	protected create<T extends object, U extends object>(options: FindOptions): FindByIdBuilder<T, U, TTerminal> {
		return new FindByIdBuilder<T, U, TTerminal>(options);
	}

	hint(hint: Record<string, -1 | 1> | string): FindByIdChain<TInput, TOutput, TTerminal> {
		return this.set({ hint });
	}

	select<TSpec extends ProjectSpec<TInput>>(spec: ValidateFieldRefs<TInput, TSpec>): FindByIdChain<TInput, ProjectOutput<TInput, TSpec>, TTerminal> {
		return this.set({ projection: spec });
	}

	private set(patch: Partial<FindOptions>): any {
		return this.create({ ...this.options, ...patch });
	}
}
