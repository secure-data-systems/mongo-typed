import { Filter } from '../filter.js';
import {
	ProjectOutput,
	ProjectSpec,
	SortSpec,
	ValidateFieldRefs
} from '../pipeline/stages.js';

// ---------------------------------------------------------------------------
// Options & configuration types
// ---------------------------------------------------------------------------

/** Enriches the builder return type with TTerminal methods. */
type Chain<TInput extends object, TOutput extends object, TTerminal> = FindBuilder<TInput, TOutput, TTerminal> & TTerminal;

export interface CollationOptions {
	alternate?: 'non-ignorable' | 'shifted',
	backwards?: boolean,
	caseFirst?: 'lower' | 'off' | 'upper',
	caseLevel?: boolean,
	locale: string,
	maxVariable?: 'punct' | 'space',
	numericOrdering?: boolean,
	strength?: 1 | 2 | 3 | 4 | 5
}

export interface FindOptions {
	collation?: CollationOptions,
	filter?: object,
	hint?: Record<string, -1 | 1> | string,
	limit?: number,
	projection?: object,
	skip?: number,
	sort?: object
}

// ---------------------------------------------------------------------------
// Terminal interface
// ---------------------------------------------------------------------------

/** Terminal interface for {@link Find} — provides `build()`. */
export interface FindTerminal {
	build: () => FindOptions
}

// ---------------------------------------------------------------------------
// FindBuilder — fluent builder with schema tracking
// ---------------------------------------------------------------------------

/**
 * Type-safe fluent builder for MongoDB find queries.
 *
 * Subclass and override `create()` plus terminal methods (`toArray`, `toStream`)
 * to connect to a real MongoDB collection.
 *
 * @example
 * ```ts
 * class MongoFind<TInput extends object, TOutput extends object = TInput>
 *   extends FindBuilder<TInput, TOutput, MyTerminal> {
 *   constructor(private collection: Collection, options?: FindOptions) { super(options); }
 *   protected override create<T extends object, U extends object>(options: FindOptions) {
 *     return new MongoFind<T, U>(this.collection as any, options);
 *   }
 * }
 * ```
 */
export class FindBuilder<TInput extends object, TOutput extends object = TInput, TTerminal = object> {
	protected readonly options: FindOptions;

	constructor(options: FindOptions = {}) {
		this.options = options;
	}

	collation(spec: CollationOptions): Chain<TInput, TOutput, TTerminal> {
		return this.set({ collation: spec });
	}

	/** Override in subclasses to control how new builder instances are created during chaining. */
	protected create<T extends object, U extends object>(options: FindOptions): FindBuilder<T, U, TTerminal> {
		return new FindBuilder<T, U, TTerminal>(options);
	}

	hint(hint: Record<string, -1 | 1> | string): Chain<TInput, TOutput, TTerminal> {
		return this.set({ hint });
	}

	limit(n: number): Chain<TInput, TOutput, TTerminal> {
		return this.set({ limit: n });
	}

	select<TSpec extends ProjectSpec<TInput>>(spec: ValidateFieldRefs<TInput, TSpec>): Chain<TInput, ProjectOutput<TInput, TSpec>, TTerminal> {
		return this.set({ projection: spec });
	}

	private set(patch: Partial<FindOptions>): any {
		return this.create({ ...this.options, ...patch });
	}

	skip(n: number): Chain<TInput, TOutput, TTerminal> {
		return this.set({ skip: n });
	}

	sort(spec: SortSpec<TInput>): Chain<TInput, TOutput, TTerminal> {
		return this.set({ sort: spec });
	}

	where(filter: Filter<TInput>): Chain<TInput, TOutput, TTerminal> {
		return this.set({ filter });
	}
}
