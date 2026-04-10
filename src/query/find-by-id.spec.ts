/* eslint-disable @typescript-eslint/no-unused-vars */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ProjectOutput } from '../pipeline/stages.js';
import type { Assert, Equals } from '../types.js';

import { FindByIdBuilder } from './find-by-id.js';
import type { FindOptions, FindTerminal } from './find.js';

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

/** Test-only concrete FindById implementation */
class FindById<TInput extends object, TOutput extends object = TInput> extends FindByIdBuilder<TInput, TOutput, FindTerminal> implements FindTerminal {
	build(): FindOptions {
		return { ...this.options };
	}

	protected override create<T extends object, U extends object>(options: FindOptions): FindById<T, U> {
		return new FindById<T, U>(options);
	}
}

// ---------------------------------------------------------------------------
// FindByIdBuilder
// ---------------------------------------------------------------------------

describe('FindByIdBuilder', () => {
	function findById<TInput extends object>(id: '_id' extends keyof TInput ? TInput['_id'] : unknown): FindById<TInput> {
		return new FindById<TInput>({ filter: { _id: id } });
	}

	it('should set filter with _id', () => {
		const opts = findById<User>('abc').build();
		assert.deepEqual(opts.filter, { _id: 'abc' });
	});

	// -------------------------------------------------------------------------
	// select
	// -------------------------------------------------------------------------

	describe('select', () => {
		it('should allow select after findById', () => {
			const opts = findById<User>('abc').select({ name: 1 }).build();
			assert.deepEqual(opts.filter, { _id: 'abc' });
			assert.deepEqual(opts.projection, { name: 1 });
		});

		it('should track projected output type', () => {
			type T1 = Assert<Equals<keyof ProjectOutput<User, { name: 1 }>, 'name'>>;
		});
	});

	// -------------------------------------------------------------------------
	// hint
	// -------------------------------------------------------------------------

	describe('hint', () => {
		it('should allow hint after findById', () => {
			const opts = findById<User>('abc').hint('name_1').build();
			assert.equal(opts.hint, 'name_1');
		});
	});

	// -------------------------------------------------------------------------
	// chaining
	// -------------------------------------------------------------------------

	describe('chaining', () => {
		it('should allow select then hint', () => {
			const opts = findById<User>('abc')
				.select({ email: 1, name: 1 })
				.hint('name_1')
				.build();
			assert.deepEqual(opts.filter, { _id: 'abc' });
			assert.deepEqual(opts.projection, { email: 1, name: 1 });
			assert.equal(opts.hint, 'name_1');
		});

		it('should allow hint then select', () => {
			const opts = findById<User>('abc')
				.hint('name_1')
				.select({ name: 1 })
				.build();
			assert.deepEqual(opts.filter, { _id: 'abc' });
			assert.deepEqual(opts.projection, { name: 1 });
			assert.equal(opts.hint, 'name_1');
		});
	});

	// -------------------------------------------------------------------------
	// unavailable methods
	// -------------------------------------------------------------------------

	describe('unavailable methods', () => {
		it('should not have where, sort, limit, skip, or collation', () => {
			const f = findById<User>('abc');
			assert.equal('where' in f, false);
			assert.equal('sort' in f, false);
			assert.equal('limit' in f, false);
			assert.equal('skip' in f, false);
			assert.equal('collation' in f, false);
		});
	});

	// -------------------------------------------------------------------------
	// typed _id
	// -------------------------------------------------------------------------

	describe('typed _id', () => {
		it('should type-check _id when present in schema', () => {
			interface Doc { _id: string, name: string }
			findById<Doc>('valid');
			// @ts-expect-error — _id is string, not number
			findById<Doc>(123);
		});
	});

	// -------------------------------------------------------------------------
	// extensibility
	// -------------------------------------------------------------------------

	describe('extensibility', () => {
		it('should be an instance of FindById', () => {
			const f = findById<User>('abc');
			assert.ok(f instanceof FindById);
		});

		it('should return FindById instances after chaining', () => {
			const f = findById<User>('abc').select({ name: 1 });
			assert.ok(f instanceof FindById);
		});
	});
});
