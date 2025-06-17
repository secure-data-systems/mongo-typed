/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it } from 'node:test';

import type { DotNotation, DotPathValue, OnlyFieldsOfTypeDotNotation } from './dot-notation.js';
import type { Assert, Equals, Includes } from './types.js';

interface Profile {
	active: boolean,
	bio: string,
	rating: number
}

interface User {
	address: {
		city: string,
		zip: number
	},
	createdAt: Date,
	email: string,
	name: string,
	profile: Profile,
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

	it('should treat dates as simple types', () => {
		type T = DotNotation<{ createdAt: Date }>;

		type T1 = Assert<Equals<T, 'createdAt'>>;
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

	it('should resolve placeholder array paths (TCheckInArray = true)', () => {
		type T1 = Assert<Equals<DotPathValue<User, 'tags.$', true, true>, string[]>>;
		type T2 = Assert<Equals<DotPathValue<User, 'tags.$[]', true, true>, string[]>>;
		type T3 = Assert<Equals<DotPathValue<User, 'tags.$[id]', true, true>, string[]>>;
		type T4 = Assert<Equals<DotPathValue<User, 'roles.$', true, true>, { name: string }[]>>;
		type T5 = Assert<Equals<DotPathValue<User, 'roles.$[]', true, true>, { name: string }[]>>;
		type T6 = Assert<Equals<DotPathValue<User, 'roles.$[id]', true, true>, { name: string }[]>>;
	});

	it('should resolve placeholder array paths (TCheckInArray = false)', () => {
		type T1 = Assert<Equals<DotPathValue<User, 'tags.$', true, false>, string>>;
		type T2 = Assert<Equals<DotPathValue<User, 'tags.$[]', true, false>, string>>;
		type T3 = Assert<Equals<DotPathValue<User, 'tags.$[id]', true, false>, string>>;
		type T4 = Assert<Equals<DotPathValue<User, 'roles.$', true, false>, { name: string }>>;
		type T5 = Assert<Equals<DotPathValue<User, 'roles.$[]', true, false>, { name: string }>>;
		type T6 = Assert<Equals<DotPathValue<User, 'roles.$[id]', true, false>, { name: string }>>;
	});

	it('should resolve deeply nested placeholders (TCheckInArray = true)', () => {
		type T1 = Assert<Equals<DotPathValue<User, 'roles.name', true, true>, string[]>>;
		type T2 = Assert<Equals<DotPathValue<User, 'roles.$.name', true, true>, string[]>>;
		type T3 = Assert<Equals<DotPathValue<User, 'roles.$[].name', true, true>, string[]>>;
	});

	it('should resolve deeply nested placeholders (TCheckInArray = false)', () => {
		type T1 = Assert<Equals<DotPathValue<User, 'roles.name', true, false>, string>>;
		type T2 = Assert<Equals<DotPathValue<User, 'roles.$.name', true, false>, string>>;
		type T3 = Assert<Equals<DotPathValue<User, 'roles.$[].name', true, false>, string>>;
	});
});

describe('OnlyFieldsOfTypeDotNotation', () => {
	it('should include only number fields', () => {
		type T = OnlyFieldsOfTypeDotNotation<User, number>;

		interface Expected {
			'address.zip'?: number,
			'profile.rating'?: number
		}

		type T1 = Assert<Equals<T, Expected>>;
	});

	it('should include only string fields', () => {
		type T = OnlyFieldsOfTypeDotNotation<User, string>;

		interface Expected {
			[x: `roles.${number}.name`]: string | undefined,
			[x: `tags.${number}`]: string | undefined,
			'address.city'?: string | undefined,
			'email'?: string | undefined,
			'name'?: string | undefined,
			'profile.bio'?: string | undefined
		}

		type T1 = Assert<Equals<T, Expected>>;
	});

	it('should include only boolean fields', () => {
		type T = OnlyFieldsOfTypeDotNotation<User, boolean>;

		interface Expected {
			'profile.active'?: boolean
		}

		type T1 = Assert<Equals<T, Expected>>;
	});

	it('should include only Date fields', () => {
		type T = OnlyFieldsOfTypeDotNotation<User, Date>;

		interface Expected {
			createdAt?: Date
		}

		type T1 = Assert<Equals<T, Expected>>;
	});

	it('should allow custom assignable type', () => {
		type T = OnlyFieldsOfTypeDotNotation<User, number, false, false, string>;

		interface Expected {
			'address.zip'?: string,
			'profile.rating'?: string
		}

		type T1 = Assert<Equals<T, Expected>>;
	});

	interface Post {
		message: string[]
	}

	it('should support placeholder dot notation when enabled', () => {
		type T = OnlyFieldsOfTypeDotNotation<User, string | string[]>;

		interface Expected {
			[x: `roles.${number}.name`]: string | undefined,
			[x: `tags.${number}`]: string | undefined,
			'address.city'?: string | undefined,
			'email'?: string | undefined,
			'name'?: string | undefined,
			'profile.bio'?: string | undefined,
			'roles.name'?: string[] | undefined,
			'tags'?: string[] | undefined
		}

		type T1 = Assert<Equals<T, Expected>>;
	});
});
