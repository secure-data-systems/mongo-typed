/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it } from 'node:test';

import type { DotNotation, DotPathValue } from './dot-notation.js';
import type { Assert, Equals, Includes } from './types.js';

// Test interface
interface User {
	address: {
		city: string,
		zip: number
	},
	email: string,
	name: string,
	roles: {
		name: string
	}[],
	tags: string[]
}

describe('DotNotation', () => {
	it('should include top-level keys', () => {
		type T = DotNotation<User>;

		type T1 = Assert<Includes<T, 'name'>>;
		type T2 = Assert<Includes<T, 'email'>>;
		type T3 = Assert<Includes<T, 'address'>>;
		type T4 = Assert<Includes<T, 'roles'>>;
		type T5 = Assert<Includes<T, 'tags'>>;
	});

	it('should include nested keys', () => {
		type T = DotNotation<User>;

		type T1 = Assert<Includes<T, 'address.city'>>;
		type T2 = Assert<Includes<T, 'address.zip'>>;
	});

	it('should include array index paths', () => {
		type T = DotNotation<User>;

		type T1 = Assert<Includes<T, 'tags.0'>>;
		type T2 = Assert<Includes<T, 'roles.0'>>;
		type T3 = Assert<Includes<T, 'roles.0.name'>>;
	});

	it('should include deep dot notation with mixed levels', () => {
		interface Deep {
			a: {
				b: {
					c: {
						d: string
					}
				}
			}
		}
		type T = DotNotation<Deep>;

		type T1 = Assert<Includes<T, 'a.b.c.d'>>;
		type T2 = Assert<Includes<T, 'a.b'>>;
	});

	it('should support placeholder paths if enabled', () => {
		type T = DotNotation<User, true>;

		type T1 = Assert<Includes<T, 'tags.$[]'>>;
		type T2 = Assert<Includes<T, 'tags.$[id]'>>;
		type T3 = Assert<Includes<T, 'roles.$[]'>>;
		type T4 = Assert<Includes<T, 'roles.$[id]'>>;
		type T5 = Assert<Includes<T, 'roles.$.name'>>;
		type T6 = Assert<Includes<T, 'roles.$[id].name'>>;
	});

	it('should stop recursion at max depth', () => {
		interface Deep { a: { b: { c: { d: { e: { f: { g: { h: { i: { j: string } } } } } } } } } }
		type T = DotNotation<Deep>;

		// should include up to 9 levels
		type T1 = Assert<Includes<T, 'a.b.c.d.e.f.g.h.i'>>;

		// @ts-expect-error should NOT include 10th level (would be 'a.b.c.d.e.f.g.h.i.j')
		type T2 = Assert<Equals<'a.b.c.d.e.f.g.h.i.j', T>>;
	});
});

describe('DotPathValue', () => {
	it('should resolve top-level fields', () => {
		type T1 = Assert<Equals<DotPathValue<User, 'name'>, string>>;
		type T2 = Assert<Equals<DotPathValue<User, 'email'>, string>>;
		type T3 = Assert<Equals<DotPathValue<User, 'address'>, { city: string, zip: number }>>;
		type T4 = Assert<Equals<DotPathValue<User, 'tags'>, string[]>>;
		type T5 = Assert<Equals<DotPathValue<User, 'roles'>, { name: string }[]>>;
	});

	it('should resolve nested fields', () => {
		type T1 = Assert<Equals<DotPathValue<User, 'address.city'>, string>>;
		type T2 = Assert<Equals<DotPathValue<User, 'address.zip'>, number>>;
	});

	it('should resolve array index values', () => {
		type T1 = Assert<Equals<DotPathValue<User, 'tags.0'>, string>>;
		type T2 = Assert<Equals<DotPathValue<User, 'tags.123'>, string>>;
		type T3 = Assert<Equals<DotPathValue<User, 'roles.0'>, { name: string }>>;
		type T4 = Assert<Equals<DotPathValue<User, 'roles.123'>, { name: string }>>;
	});

	it('should resolve placeholder array paths (TAllowPlaceholder = true)', () => {
		type T1 = Assert<Equals<DotPathValue<User, 'tags.$', true>, string[]>>;
		type T2 = Assert<Equals<DotPathValue<User, 'tags.$[]', true>, string[]>>;
		type T3 = Assert<Equals<DotPathValue<User, 'tags.$[id]', true>, string[]>>;
		type T4 = Assert<Equals<DotPathValue<User, 'roles.$', true>, { name: string }[]>>;
		type T5 = Assert<Equals<DotPathValue<User, 'roles.$[]', true>, { name: string }[]>>;
		type T6 = Assert<Equals<DotPathValue<User, 'roles.$[id]', true>, { name: string }[]>>;
	});

	it('should resolve deeply nested placeholders', () => {
		type T1 = Assert<Equals<DotPathValue<User, 'roles.$.name', true>, string[]>>;
		type T2 = Assert<Equals<DotPathValue<User, 'roles.$[].name', true>, string[]>>;
	});
});
