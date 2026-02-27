/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it } from 'node:test';

import type { BooleanExpr, FieldRef } from './expr.js';
import type { Assert, Includes, Not } from './types.js';

type TestRef = FieldRef<User>;

interface User {
	address: {
		city: string,
		zip: number
	}[],
	email: string,
	name: string,
	tags: string[]
}

describe('BooleanExpr', () => {
	describe('$and', () => {
		it('should accept an array of boolean expressions', () => {
			type T1 = Assert<Includes<BooleanExpr<User>, { $and: [true, false] }>>;
			type T2 = Assert<Includes<BooleanExpr<User>, { $and: [{ $gt: ['$name', 'a'] }] }>>;
		});

		it('should NOT accept a non-array ArrayExpr as its value', () => {
			type T1 = Assert<Not<Includes<BooleanExpr<User>, { $and: { $reverseArray: unknown[] } }>>>;
			type T2 = Assert<Not<Includes<BooleanExpr<User>, { $and: { $filter: { cond: true, input: [] } } }>>>;
		});

		it('should behave consistently with $or and $nor, which correctly use Expr<TInput>[]', () => {
			// $or and $nor correctly reject non-array ArrayExpr forms
			type T1 = Assert<Not<Includes<BooleanExpr<User>, { $or: { $reverseArray: unknown[] } }>>>;
			type T2 = Assert<Not<Includes<BooleanExpr<User>, { $nor: { $reverseArray: unknown[] } }>>>;
		});
	});
});
