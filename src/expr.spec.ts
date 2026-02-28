/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it } from 'node:test';

import type { ArrayExpr, BooleanExpr, DateExpr, FieldRef, NumericExpr, TypeExpr, VariableExpr } from './expr.js';
import type { Assert, Includes, Not } from './types.js';

type TestRef = FieldRef<User>;

interface User {
	address: {
		city: string,
		zip: number
	}[],
	createdAt: Date,
	email: string,
	name: string,
	tags: string[]
}

describe('ArrayExpr', () => {
	describe('$arrayElemAt', () => {
		it('should include $arrayElemAt operator', () => {
			type T1 = Assert<Includes<ArrayExpr<User>, { $arrayElemAt: [unknown[], number] }>>;
		});
	});

	describe('$first', () => {
		it('should include $first operator', () => {
			type T1 = Assert<Includes<ArrayExpr<User>, { $first: unknown[] }>>;
		});
	});

	describe('$indexOfArray', () => {
		it('should include $indexOfArray operator', () => {
			type T1 = Assert<Includes<ArrayExpr<User>, { $indexOfArray: [string[], string] }>>;
		});
	});

	describe('$last', () => {
		it('should include $last operator', () => {
			type T1 = Assert<Includes<ArrayExpr<User>, { $last: unknown[] }>>;
		});
	});

	describe('$arrayToObject', () => {
		it('should include $arrayToObject operator', () => {
			type T1 = Assert<Includes<ArrayExpr<User>, { $arrayToObject: unknown[] }>>;
		});
	});

	describe('$objectToArray', () => {
		it('should include $objectToArray operator', () => {
			type T1 = Assert<Includes<ArrayExpr<User>, { $objectToArray: '$email' }>>;
		});
	});

	describe('$split', () => {
		it('should include $split operator (splits a string into an array)', () => {
			type T1 = Assert<Includes<ArrayExpr<User>, { $split: ['$name', '-'] }>>;
		});
	});

	describe('$setIntersection', () => {
		it('should accept two arrays', () => {
			type T1 = Assert<Includes<ArrayExpr<User>, { $setIntersection: ['$tags', '$tags'] }>>;
		});

		it('should accept more than two arrays', () => {
			type T1 = Assert<Includes<ArrayExpr<User>, { $setIntersection: ['$tags', '$tags', '$tags'] }>>;
		});
	});

	describe('$setUnion', () => {
		it('should accept two arrays', () => {
			type T1 = Assert<Includes<ArrayExpr<User>, { $setUnion: ['$tags', '$tags'] }>>;
		});

		it('should accept more than two arrays', () => {
			type T1 = Assert<Includes<ArrayExpr<User>, { $setUnion: ['$tags', '$tags', '$tags'] }>>;
		});
	});
});

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

	describe('$allElementsTrue', () => {
		it('should accept a wrapped array expression', () => {
			type T1 = Assert<Includes<BooleanExpr<User>, { $allElementsTrue: ['$tags'] }>>;
		});

		it('should NOT accept a bare (unwrapped) array expression', () => {
			type T1 = Assert<Not<Includes<BooleanExpr<User>, { $allElementsTrue: '$tags' }>>>;
		});
	});

	describe('$anyElementTrue', () => {
		it('should accept a wrapped array expression', () => {
			type T1 = Assert<Includes<BooleanExpr<User>, { $anyElementTrue: ['$tags'] }>>;
		});

		it('should NOT accept a bare (unwrapped) array expression', () => {
			type T1 = Assert<Not<Includes<BooleanExpr<User>, { $anyElementTrue: '$tags' }>>>;
		});
	});

	describe('$isArray', () => {
		it('should include $isArray operator', () => {
			type T1 = Assert<Includes<BooleanExpr<User>, { $isArray: '$tags' }>>;
		});
	});

	describe('$nin', () => {
		it('should NOT be a valid aggregation expression operator', () => {
			type T1 = Assert<Not<Includes<BooleanExpr<User>, { $nin: ['$name', ['alice']] }>>>;
		});
	});

	describe('$nor', () => {
		it('should NOT be a valid aggregation expression operator', () => {
			type T1 = Assert<Not<Includes<BooleanExpr<User>, { $nor: [true, false] }>>>;
		});
	});

	describe('$not', () => {
		it('should accept a wrapped expression', () => {
			type T1 = Assert<Includes<BooleanExpr<User>, { $not: [{ $gt: ['$name', 'a'] }] }>>;
		});

		it('should NOT accept a bare (unwrapped) expression', () => {
			type T1 = Assert<Not<Includes<BooleanExpr<User>, { $not: '$name' }>>>;
		});
	});
});

describe('DateExpr', () => {
	describe('$toDate', () => {
		it('should include $toDate operator', () => {
			type T1 = Assert<Includes<DateExpr<User>, { $toDate: '$createdAt' }>>;
		});
	});

	describe('$dateAdd', () => {
		it('should include $dateAdd operator', () => {
			type T1 = Assert<Includes<DateExpr<User>, { $dateAdd: { amount: 1, startDate: Date, unit: 'day' } }>>;
		});
	});

	describe('$dateSubtract', () => {
		it('should include $dateSubtract operator', () => {
			type T1 = Assert<Includes<DateExpr<User>, { $dateSubtract: { amount: 1, startDate: Date, unit: 'day' } }>>;
		});
	});

	describe('$dateTrunc', () => {
		it('should include $dateTrunc operator', () => {
			type T1 = Assert<Includes<DateExpr<User>, { $dateTrunc: { date: Date, unit: 'day' } }>>;
		});
	});
});

describe('NumericExpr', () => {
	describe('$atan2', () => {
		it('should include $atan2 operator', () => {
			type T1 = Assert<Includes<NumericExpr<User>, { $atan2: [number, number] }>>;
		});
	});

	describe('$indexOfBytes', () => {
		it('should include $indexOfBytes operator', () => {
			type T1 = Assert<Includes<NumericExpr<User>, { $indexOfBytes: ['$name', 'o'] }>>;
		});
	});

	describe('$indexOfCP', () => {
		it('should include $indexOfCP operator', () => {
			type T1 = Assert<Includes<NumericExpr<User>, { $indexOfCP: ['$name', 'o'] }>>;
		});
	});

	describe('$strcasecmp', () => {
		it('should include $strcasecmp operator', () => {
			type T1 = Assert<Includes<NumericExpr<User>, { $strcasecmp: ['$name', 'alice'] }>>;
		});
	});

	describe('date-part operators', () => {
		it('should accept a valid date expression for each operator', () => {
			type T1 = Assert<Includes<NumericExpr<User>, { $dayOfMonth: '$createdAt' }>>;
			type T2 = Assert<Includes<NumericExpr<User>, { $dayOfWeek: '$createdAt' }>>;
			type T3 = Assert<Includes<NumericExpr<User>, { $dayOfYear: '$createdAt' }>>;
			type T4 = Assert<Includes<NumericExpr<User>, { $hour: '$createdAt' }>>;
			type T5 = Assert<Includes<NumericExpr<User>, { $isoDayOfWeek: '$createdAt' }>>;
			type T6 = Assert<Includes<NumericExpr<User>, { $isoWeek: '$createdAt' }>>;
			type T7 = Assert<Includes<NumericExpr<User>, { $isoWeekYear: '$createdAt' }>>;
			type T8 = Assert<Includes<NumericExpr<User>, { $millisecond: '$createdAt' }>>;
			type T9 = Assert<Includes<NumericExpr<User>, { $minute: '$createdAt' }>>;
			type T10 = Assert<Includes<NumericExpr<User>, { $month: '$createdAt' }>>;
			type T11 = Assert<Includes<NumericExpr<User>, { $second: '$createdAt' }>>;
			type T12 = Assert<Includes<NumericExpr<User>, { $week: '$createdAt' }>>;
			type T13 = Assert<Includes<NumericExpr<User>, { $year: '$createdAt' }>>;
		});

		it('should NOT accept an empty object (all keys currently optional — bug)', () => {
			type T1 = Assert<Not<Includes<NumericExpr<User>, Record<never, never>>>>;
		});
	});
});

describe('TypeExpr', () => {
	describe('$type', () => {
		it('should accept a valid $type expression', () => {
			type T1 = Assert<Includes<TypeExpr<User>, { $type: '$name' }>>;
		});

		it('should require a $type operand (not match an unrelated object)', () => {
			type T1 = Assert<Not<Includes<TypeExpr<User>, { unrelated: string }>>>;
		});
	});
});

describe('VariableExpr', () => {
	it('should accept $let with vars and in', () => {
		type T1 = Assert<Includes<VariableExpr<User>, { $let: { in: '$name', vars: { x: '$email' } } }>>;
	});

	it('should not match an object with no $let, $map, or $reduce key', () => {
		type T1 = Assert<Not<Includes<VariableExpr<User>, { unrelated: string }>>>;
	});
});
