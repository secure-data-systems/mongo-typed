/* eslint-disable @typescript-eslint/no-unused-vars */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ProjectOutput } from '../pipeline/stages.js';
import type { Assert, Equals } from '../types.js';

import { FindBuilder, FindOptions, FindTerminal } from './find.js';

interface Address {
	city: string,
	zip: number
}

interface User {
	active: boolean,
	address: Address[],
	department: string,
	email: string,
	name: string,
	score: number,
	tags: string[]
}

/** Test-only concrete Find implementation */
class Find<TInput extends object, TOutput extends object = TInput> extends FindBuilder<TInput, TOutput, FindTerminal> implements FindTerminal {
	build(): FindOptions {
		return { ...this.options };
	}

	protected override create<T extends object, U extends object>(options: FindOptions): Find<T, U> {
		return new Find<T, U>(options);
	}
}

// ---------------------------------------------------------------------------
// FindBuilder
// ---------------------------------------------------------------------------

describe('FindBuilder', () => {
	function find<TInput extends object>(): Find<TInput> {
		return new Find<TInput>();
	}

	it('should return a Find instance', () => {
		const f = find<User>();
		assert.ok(f instanceof Find);
	});

	// -------------------------------------------------------------------------
	// where
	// -------------------------------------------------------------------------

	describe('where', () => {
		it('should accept a valid Filter<User>', () => {
			find<User>().where({ active: true, name: 'Alice' });
		});

		it('should reject invalid field names', () => {
			// @ts-expect-error 'nonExistent' is not a field on User
			find<User>().where({ nonExistent: true });
		});

		it('should store the filter in options', () => {
			const opts = find<User>().where({ active: true }).build();
			assert.deepEqual(opts.filter, { active: true });
		});
	});

	// -------------------------------------------------------------------------
	// select (projection)
	// -------------------------------------------------------------------------

	describe('select', () => {
		it('should accept inclusion mode', () => {
			find<User>().select({ email: 1, name: 1 });
		});

		it('should accept exclusion mode', () => {
			find<User>().select({ tags: 0 });
		});

		it('should store the projection in options', () => {
			const opts = find<User>().select({ email: 1, name: 1 }).build();
			assert.deepEqual(opts.projection, { email: 1, name: 1 });
		});

		it('should infer output type for inclusion projection', () => {
			type T1 = Assert<Equals<ProjectOutput<User, { name: 1 }>['name'], string>>;
		});

		it('should track projected output type', () => {
			type T1 = Assert<Equals<keyof ProjectOutput<User, { name: 1 }>, 'name'>>;
		});

		it('should reject invalid field refs', () => {
			find<User>()
				.select({
					// @ts-expect-error — $nonExistent is not a valid field ref
					bad: '$nonExistent',
					good: '$email'
				});
		});

		it('should accept number literals in projection', () => {
			find<User>().select({ num: 123, score: 1 });
		});
	});

	// -------------------------------------------------------------------------
	// sort
	// -------------------------------------------------------------------------

	describe('sort', () => {
		it('should accept valid field paths with direction', () => {
			find<User>().sort({ name: 1, score: -1 });
		});

		it('should accept nested dot-notation paths', () => {
			find<User>().sort({ 'address.city': 1 });
		});

		it('should reject unknown field names', () => {
			// @ts-expect-error 'nonExistent' is not a valid sort key on User
			find<User>().sort({ nonExistent: 1 });
		});

		it('should store the sort in options', () => {
			const opts = find<User>().sort({ name: 1 }).build();
			assert.deepEqual(opts.sort, { name: 1 });
		});
	});

	// -------------------------------------------------------------------------
	// limit
	// -------------------------------------------------------------------------

	describe('limit', () => {
		it('should accept a number', () => {
			find<User>().limit(10);
		});

		it('should store the limit in options', () => {
			const opts = find<User>().limit(10).build();
			assert.equal(opts.limit, 10);
		});
	});

	// -------------------------------------------------------------------------
	// skip
	// -------------------------------------------------------------------------

	describe('skip', () => {
		it('should accept a number', () => {
			find<User>().skip(5);
		});

		it('should store the skip in options', () => {
			const opts = find<User>().skip(5).build();
			assert.equal(opts.skip, 5);
		});
	});

	// -------------------------------------------------------------------------
	// collation
	// -------------------------------------------------------------------------

	describe('collation', () => {
		it('should accept a valid collation spec', () => {
			find<User>().collation({ locale: 'en', strength: 2 });
		});

		it('should store the collation in options', () => {
			const opts = find<User>().collation({ locale: 'en' }).build();
			assert.deepEqual(opts.collation, { locale: 'en' });
		});
	});

	// -------------------------------------------------------------------------
	// hint
	// -------------------------------------------------------------------------

	describe('hint', () => {
		it('should accept a string (index name)', () => {
			find<User>().hint('name_1');
		});

		it('should accept an index spec object', () => {
			find<User>().hint({ name: 1, score: -1 });
		});

		it('should store the hint in options', () => {
			const opts = find<User>().hint('name_1').build();
			assert.equal(opts.hint, 'name_1');
		});
	});

	// -------------------------------------------------------------------------
	// chaining
	// -------------------------------------------------------------------------

	describe('chaining', () => {
		it('should support full chain: where → select → sort → limit → skip', () => {
			const opts = find<User>()
				.where({ active: true })
				.select({ email: 1, name: 1 })
				.sort({ name: 1 })
				.limit(10)
				.skip(5)
				.build();

			assert.deepEqual(opts, {
				filter: { active: true },
				limit: 10,
				projection: { email: 1, name: 1 },
				skip: 5,
				sort: { name: 1 }
			});
		});

		it('should support chaining with collation and hint', () => {
			const opts = find<User>()
				.where({ department: 'eng' })
				.collation({ locale: 'en' })
				.hint('dept_1')
				.build();

			assert.deepEqual(opts, {
				collation: { locale: 'en' },
				filter: { department: 'eng' },
				hint: 'dept_1'
			});
		});

		it('should overwrite previous values when called again', () => {
			const opts = find<User>()
				.limit(10)
				.limit(20)
				.build();

			assert.equal(opts.limit, 20);
		});
	});

	// -------------------------------------------------------------------------
	// build
	// -------------------------------------------------------------------------

	describe('build', () => {
		it('should return empty object for no options', () => {
			assert.deepEqual(find<User>().build(), {});
		});

		it('should return a copy of options', () => {
			const f = find<User>().where({ active: true });
			const a = f.build();
			const b = f.build();
			assert.notEqual(a, b);
			assert.deepEqual(a, b);
		});
	});

	// -------------------------------------------------------------------------
	// extensibility
	// -------------------------------------------------------------------------

	describe('extensibility', () => {
		it('should be an instance of Find', () => {
			const f = find<User>();
			assert.ok(f instanceof Find);
		});

		it('should return Find instances after chaining', () => {
			const f = find<User>().where({ active: true });
			assert.ok(f instanceof Find);
		});

		it('should return Find instances through multi-step chains', () => {
			const f = find<User>()
				.where({ active: true })
				.sort({ name: 1 })
				.limit(10);
			assert.ok(f instanceof Find);
		});
	});
});
