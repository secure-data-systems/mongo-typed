/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it } from 'node:test';

import { NumericType } from './bson-types.js';
import { DotNotation, DotPathValue, OnlyFieldsOfTypeDotNotation } from './dot-notation.js';
import { Filter } from './filter.js';
import { Assert, Equals } from './types.js';
import { Update } from './update.js';

interface Role {
	id: string,
	name: string,
	priority: number
}
interface User {
	age: null | number,
	email?: string,
	meta?: {
		lastLogin?: Date,
		rating?: number
	},
	name: string,
	roles: Role[],
	tags?: string[]
}

describe('Update', () => {
	it('should allow $set with any field', () => {
		type T = Update<User>['$set'];
		type Expected = Readonly<Partial<{
			[x: `roles.$[${string}].id`]: string,
			[x: `roles.$[${string}].name`]: string,
			[x: `roles.$[${string}].priority`]: number,
			[x: `roles.$[${string}]`]: Role,
			[x: `roles.${number}.id`]: string,
			[x: `roles.${number}.name`]: string,
			[x: `roles.${number}.priority`]: number,
			[x: `roles.${number}`]: Role,
			[x: `tags.$[${string}]`]: string,
			[x: `tags.${number}`]: string,
			'age': null | number,
			'email': string,
			'meta'?: {
				lastLogin?: Date,
				rating?: number
			},
			'meta.lastLogin'?: Date | undefined,
			'meta.rating'?: number | undefined,
			'name': string,
			'roles': Role[],
			'roles.$': Role,
			'roles.$.id': string,
			'roles.$.name': string,
			'roles.$.priority': number,
			'roles.id': string,
			'roles.name': string,
			'roles.priority': number,
			'tags': string[],
			'tags.$'?: string | undefined
		}>>;

		type T1 = Assert<Equals<Expected | undefined, T>>;
	});

	it('should allow $inc with numeric fields including arrays', () => {
		type T = Update<User>['$inc'];

		type Expected = Partial<{
			[x: `roles.$[${string}].priority`]: NumericType,
			[x: `roles.${number}.priority`]: NumericType,
			'age': NumericType,
			'meta.rating': NumericType,
			'roles.$.priority': NumericType,
			'roles.priority': NumericType
		}>;

		type T1 = Assert<Equals<Expected | undefined, T>>;
	});

	it('should allow $bit with numeric fields', () => {
		type T = Update<User>['$bit'];

		type Expected = Partial<{
			[x: `roles.$[${string}].priority`]: { and: NumericType } | { or: NumericType } | { xor: NumericType },
			[x: `roles.${number}.priority`]: { and: NumericType } | { or: NumericType } | { xor: NumericType },
			'age': { and: NumericType } | { or: NumericType } | { xor: NumericType },
			'meta.rating': { and: NumericType } | { or: NumericType } | { xor: NumericType },
			'roles.$.priority': { and: NumericType } | { or: NumericType } | { xor: NumericType },
			'roles.priority': { and: NumericType } | { or: NumericType } | { xor: NumericType }
		}>;

		type T1 = Assert<Equals<Expected | undefined, T>>;
	});

	it('should allow $addToSet for arrays', () => {
		type T = Update<User>['$addToSet'];

		type Expected = Partial<{
			'roles': Role | { $each: ReadonlyArray<Role> },
			'tags': string | { $each: ReadonlyArray<string> }
		}>;

		const t1: Expected = {};
		const t: T = t1;

		type T1 = Assert<Equals<Expected | undefined, T>>;
	});

	it('should allow $pull with item filters', () => {
		type T = Update<User>['$pull'];

		type Expected = Partial<{
			roles: Filter<Role>,
			tags: Filter<string>
		}>;

		type T1 = Assert<Equals<Expected | undefined, T>>;
	});

	it('should allow $pop with array fields only', () => {
		type T = Update<User>['$pop'];

		type Expected = Partial<{
			roles: -1 | 1,
			tags: -1 | 1
		}>;

		type T1 = Assert<Equals<Expected | undefined, T>>;
	});

	it('should allow $rename as string-to-string mapping', () => {
		type T = Update<User>['$rename'];

		type T1 = Assert<Equals<Record<string, string> | undefined, T>>;
	});

	it('should allow $unset with any field', () => {
		type T = Update<User>['$unset'];

		type Expected = Partial<{
			'email'?: 1 | '' | boolean | undefined,
			'meta'?: 1 | '' | boolean | undefined,
			'meta.lastLogin'?: 1 | '' | boolean | undefined,
			'meta.rating'?: 1 | '' | boolean | undefined,
			'tags'?: 1 | '' | boolean | undefined
		}>;

		type T1 = Assert<Equals<Expected | undefined, T>>;
	});
});
