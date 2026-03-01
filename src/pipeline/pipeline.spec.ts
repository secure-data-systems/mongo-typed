/* eslint-disable @typescript-eslint/no-unused-vars */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Assert, Equals, Includes } from '../types.js';
import type {
	AccumulatorExpr,
	GroupOutput,
	GroupSpec,
	PipelineStage,
	ProjectOutput,
	SortSpec,
	UnwindOutput
} from './stages.js';

import { pipeline, PipelineBuilder } from './builder.js';

interface Address {
	city: string,
	zip: number
}

interface Order {
	amount: number,
	status: string,
	userId: string
}

interface User {
	active: boolean,
	address: Address[],
	createdAt: Date,
	department: string,
	email: string,
	name: string,
	score: number,
	tags: string[]
}

// ---------------------------------------------------------------------------
// AccumulatorExpr
// ---------------------------------------------------------------------------

describe('AccumulatorExpr', () => {
	describe('$sum', () => {
		it('should include $sum accumulator', () => {
			type T1 = Assert<Includes<AccumulatorExpr<User>, { $sum: number }>>;
		});
	});

	describe('$avg', () => {
		it('should include $avg accumulator', () => {
			type T1 = Assert<Includes<AccumulatorExpr<User>, { $avg: '$score' }>>;
		});
	});

	describe('$push', () => {
		it('should include $push accumulator', () => {
			type T1 = Assert<Includes<AccumulatorExpr<User>, { $push: '$name' }>>;
		});
	});

	describe('$addToSet', () => {
		it('should include $addToSet accumulator', () => {
			type T1 = Assert<Includes<AccumulatorExpr<User>, { $addToSet: '$email' }>>;
		});
	});

	describe('$first / $last', () => {
		it('should include $first accumulator', () => {
			type T1 = Assert<Includes<AccumulatorExpr<User>, { $first: '$name' }>>;
		});

		it('should include $last accumulator', () => {
			type T1 = Assert<Includes<AccumulatorExpr<User>, { $last: '$name' }>>;
		});
	});

	describe('$min / $max', () => {
		it('should include $min accumulator', () => {
			type T1 = Assert<Includes<AccumulatorExpr<User>, { $min: '$score' }>>;
		});

		it('should include $max accumulator', () => {
			type T1 = Assert<Includes<AccumulatorExpr<User>, { $max: '$score' }>>;
		});
	});

	describe('$count', () => {
		it('should include $count accumulator', () => {
			type T1 = Assert<Includes<AccumulatorExpr<User>, { $count: Record<string, never> }>>;
		});
	});

	describe('$stdDevPop / $stdDevSamp', () => {
		it('should include $stdDevPop accumulator', () => {
			type T1 = Assert<Includes<AccumulatorExpr<User>, { $stdDevPop: '$score' }>>;
		});

		it('should include $stdDevSamp accumulator', () => {
			type T1 = Assert<Includes<AccumulatorExpr<User>, { $stdDevSamp: '$score' }>>;
		});
	});

	describe('$top / $bottom', () => {
		it('should include $top accumulator', () => {
			type T1 = Assert<Includes<AccumulatorExpr<User>, { $top: { output: '$name', sortBy: { score: -1 } } }>>;
		});

		it('should include $bottom accumulator', () => {
			type T1 = Assert<Includes<AccumulatorExpr<User>, { $bottom: { output: '$name', sortBy: { score: 1 } } }>>;
		});
	});
});

// ---------------------------------------------------------------------------
// SortSpec
// ---------------------------------------------------------------------------

describe('SortSpec', () => {
	it('should accept valid field paths with direction', () => {
		type T1 = Assert<Includes<SortSpec<User>, { name?: -1 | 1 | { $meta: string } }>>;
	});

	it('should accept nested dot-notation fields', () => {
		type T1 = Assert<Includes<SortSpec<User>, { 'address.city'?: -1 | 1 | { $meta: string } }>>;
	});
});

// ---------------------------------------------------------------------------
// PipelineStage — flat union for sub-pipeline use
// ---------------------------------------------------------------------------

describe('PipelineStage', () => {
	it('should accept $match stage', () => {
		const stage: PipelineStage<User> = { $match: { name: 'Alice' } };
	});

	it('should accept $sort stage', () => {
		const stage: PipelineStage<User> = { $sort: { score: -1 } };
	});

	it('should accept $limit stage', () => {
		const stage: PipelineStage<User> = { $limit: 10 };
	});

	it('should accept $group stage', () => {
		const stage: PipelineStage<User> = {
			$group: { _id: '$department', total: { $sum: 1 } }
		};
	});

	it('should accept $lookup stage with equality join', () => {
		const stage: PipelineStage<User> = {
			$lookup: { as: 'orders', foreignField: 'userId', from: 'orders', localField: 'email' }
		};
	});
});

// ---------------------------------------------------------------------------
// pipeline() builder — schema-preserving stages
// ---------------------------------------------------------------------------

describe('pipeline() builder', () => {
	describe('match', () => {
		it('should accept a valid Filter<User>', () => {
			pipeline<User>().match({ active: true, name: 'Alice' });
		});

		it('should reject invalid field names', () => {
			// @ts-expect-error 'nonExistent' is not a field on User
			pipeline<User>().match({ nonExistent: true });
		});

		it('should return PipelineBuilder<User> (schema unchanged)', () => {
			const builder: PipelineBuilder<User> = pipeline<User>().match({ active: true });
		});
	});

	describe('sort', () => {
		it('should accept valid top-level field paths', () => {
			pipeline<User>().sort({ name: 1, score: -1 });
		});

		it('should accept nested dot-notation paths', () => {
			pipeline<User>().sort({ 'address.city': 1 });
		});

		it('should reject unknown field names', () => {
			// @ts-expect-error 'nonExistent' is not a valid sort key on User
			pipeline<User>().sort({ nonExistent: 1 });
		});

		it('should preserve the input schema', () => {
			const builder: PipelineBuilder<User> = pipeline<User>().sort({ name: 1 });
		});
	});

	describe('limit', () => {
		it('should accept a number', () => {
			pipeline<User>().limit(10);
		});

		it('should preserve the input schema', () => {
			const builder: PipelineBuilder<User> = pipeline<User>().limit(10);
		});
	});

	describe('skip', () => {
		it('should accept a number', () => {
			pipeline<User>().skip(5);
		});

		it('should preserve the input schema', () => {
			const builder: PipelineBuilder<User> = pipeline<User>().skip(5);
		});
	});

	describe('sample', () => {
		it('should accept a size spec', () => {
			pipeline<User>().sample({ size: 10 });
		});

		it('should preserve the input schema', () => {
			const builder: PipelineBuilder<User> = pipeline<User>().sample({ size: 10 });
		});
	});

	// -------------------------------------------------------------------------
	// Schema-transforming — inferred output
	// -------------------------------------------------------------------------

	describe('group', () => {
		it('should accept a valid group spec', () => {
			pipeline<User>().group({ _id: '$department', total: { $sum: 1 } });
		});

		it('should accept null _id for global grouping', () => {
			pipeline<User>().group({ _id: null, total: { $sum: 1 } });
		});

		it('$sum accumulator should produce number in output schema', () => {
			type Result = GroupOutput<User, { _id: null, total: { $sum: number } }>;
			type T1 = Assert<Equals<Result['total'], number>>;
		});

		it('$avg accumulator should produce number in output schema', () => {
			type Result = GroupOutput<User, { _id: null, avg: { $avg: '$score' } }>;
			type T1 = Assert<Equals<Result['avg'], number>>;
		});

		it('$push accumulator should produce typed array in output schema', () => {
			type Result = GroupOutput<User, { _id: null, names: { $push: '$name' } }>;
			type T1 = Assert<Equals<Result['names'], string[]>>;
		});

		it('$addToSet accumulator should produce typed array in output schema', () => {
			type Result = GroupOutput<User, { _id: null, tags: { $addToSet: '$department' } }>;
			type T1 = Assert<Equals<Result['tags'], string[]>>;
		});

		it('null _id should produce null in output schema', () => {
			type Result = GroupOutput<User, { _id: null, total: { $sum: 1 } }>;
			type T1 = Assert<Equals<Result['_id'], null>>;
		});

		it('should track the group output schema for downstream stages', () => {
			pipeline<User>()
				.group({ _id: null, total: { $sum: 1 } })
				.sort({ total: -1 }); // 'total' is in the output schema
		});

		it('should reject pre-group fields in downstream sort', () => {
			pipeline<User>()
				.group({ _id: null, total: { $sum: 1 } })
				// @ts-expect-error 'name' is not in the group output schema
				.sort({ name: 1 });
		});
	});

	describe('count', () => {
		it('should produce Record<field, number> output schema', () => {
			const builder = pipeline<User>().count('total');
			type T1 = Assert<Equals<typeof builder, PipelineBuilder<Record<'total', number>>>>;
		});

		it('should allow sorting on the count field downstream', () => {
			pipeline<User>().count('total').sort({ total: 1 });
		});

		it('should reject pre-count fields in downstream sort', () => {
			pipeline<User>()
				.count('total')
				// @ts-expect-error 'name' is not in the count output schema
				.sort({ name: 1 });
		});
	});

	describe('addFields', () => {
		it('should accept valid expressions', () => {
			pipeline<User>().addFields({ nameLen: { $strLenCP: '$name' } });
		});

		it('should allow sorting on the added field downstream', () => {
			pipeline<User>()
				.addFields({ nameLen: { $strLenCP: '$name' } })
				.sort({ nameLen: 1 });
		});

		it('should still allow sorting on original fields downstream', () => {
			pipeline<User>()
				.addFields({ nameLen: { $strLenCP: '$name' } })
				.sort({ name: 1 });
		});
	});

	describe('set', () => {
		it('should behave identically to addFields', () => {
			pipeline<User>()
				.set({ nameLen: { $strLenCP: '$name' } })
				.sort({ nameLen: 1 });
		});
	});

	describe('unset', () => {
		it('should remove a single field from the output schema', () => {
			pipeline<User>()
				.unset('name')
				// @ts-expect-error 'name' was removed by $unset
				.sort({ name: 1 });
		});

		it('should remove multiple fields from the output schema', () => {
			pipeline<User>()
				.unset(['name', 'email'])
				// @ts-expect-error 'email' was removed by $unset
				.sort({ email: 1 });
		});

		it('should leave other fields accessible', () => {
			pipeline<User>()
				.unset('name')
				.sort({ score: -1 }); // 'score' was not removed
		});
	});

	describe('unwind', () => {
		it('should accept a field reference string', () => {
			pipeline<User>().unwind('$tags');
		});

		it('should accept an options object', () => {
			pipeline<User>().unwind({ path: '$tags', preserveNullAndEmptyArrays: true });
		});

		it('should unwrap array field to element type', () => {
			// tags: string[] → tags: string after unwind
			type Result = UnwindOutput<User, '$tags'>;
			type T1 = Assert<Equals<Result['tags'], string>>;
		});

		it('should allow sorting on the unwound field downstream', () => {
			pipeline<User>()
				.unwind('$tags')
				.sort({ tags: 1 });
		});
	});

	describe('lookup', () => {
		it('should accept an equality join spec', () => {
			pipeline<User>().lookup<Order, 'orders'>({
				as: 'orders',
				foreignField: 'userId',
				from: 'orders',
				localField: 'email'
			});
		});

		it('should accept a pipeline join spec', () => {
			pipeline<User>().lookup<Order, 'orders'>({
				as: 'orders',
				from: 'orders',
				pipeline: [{ $match: { status: 'active' } }]
			});
		});

		it('should add foreign collection as typed array field', () => {
			const builder = pipeline<User>().lookup<Order, 'orders'>({
				as: 'orders',
				foreignField: 'userId',
				from: 'orders',
				localField: 'email'
			});
			type T1 = Assert<Equals<typeof builder, PipelineBuilder<User & Record<'orders', Order[]>>>>;
		});

		it('should allow sorting on nested lookup fields downstream', () => {
			pipeline<User>()
				.lookup<Order, 'orders'>({ as: 'orders', foreignField: 'userId', from: 'orders', localField: 'email' })
				.sort({ 'orders.amount': 1 });
		});
	});

	describe('project', () => {
		describe('inclusion mode (any field = 1)', () => {
			it('should carry the TInput field type for 1-valued fields', () => {
				type T1 = Assert<Equals<ProjectOutput<User, { name: 1 }>['name'], string>>;
			});

			it('should only include specified fields (others dropped)', () => {
				type T1 = Assert<Equals<keyof ProjectOutput<User, { name: 1 }>, 'name'>>;
			});

			it('should drop 0-valued fields', () => {
				type T1 = Assert<Equals<keyof ProjectOutput<User, { _id: 0, name: 1 }>, 'name'>>;
			});

			it('should infer string for string expression fields', () => {
				type T1 = Assert<Equals<ProjectOutput<User, { name: 1, upper: { $toUpper: '$name' } }>['upper'], string>>;
			});

			it('should track the inclusion output schema for downstream stages', () => {
				pipeline<User>()
					.project({ name: 1 })
					.sort({ name: 1 }); // 'name' is in inclusion output
			});

			it('should reject non-included fields in downstream stages', () => {
				pipeline<User>()
					.project({ name: 1 })
					// @ts-expect-error 'email' was not included in the projection
					.sort({ email: 1 });
			});

			it('should reconstruct nested object for dot-notation inclusion field', () => {
				type T1 = Assert<Equals<ProjectOutput<User, { 'address.city': 1 }>['address'], Array<{ city: string }>>>;
			});

			it('should use top-level key not flat dot key in inclusion output', () => {
				type T1 = Assert<Equals<keyof ProjectOutput<User, { 'address.city': 1 }>, 'address'>>;
			});

			it('should track dot-notation inclusion output for downstream stages', () => {
				pipeline<User>()
					.project({ 'address.city': 1 })
					.sort({ 'address': 1 });
			});

			it('should reject non-projected top-level fields after dot-notation inclusion', () => {
				pipeline<User>()
					.project({ 'address.city': 1 })
					// @ts-expect-error 'name' was not included in the projection
					.sort({ name: 1 });
			});
		});

		describe('exclusion mode (no field = 1)', () => {
			it('should preserve non-excluded TInput field types', () => {
				type T1 = Assert<Equals<ProjectOutput<User, { email: 0 }>['name'], string>>;
			});

			it('should allow sorting on retained fields downstream', () => {
				pipeline<User>()
					.project({ email: 0 })
					.sort({ name: 1 }); // 'name' was kept
			});

			it('should reject excluded fields in downstream stages', () => {
				pipeline<User>()
					.project({ email: 0 })
					// @ts-expect-error 'email' was excluded by the projection
					.sort({ email: 1 });
			});

			it('should infer number for numeric expression fields', () => {
				type T1 = Assert<Equals<ProjectOutput<User, { score: { $multiply: ['$score', 2] } }>['score'], number>>;
			});

			it('should retain all other fields when a computed field overrides one', () => {
				type T1 = Assert<Equals<ProjectOutput<User, { score: { $multiply: ['$score', 2] } }>['name'], string>>;
			});
		});
	});

	describe('replaceRoot', () => {
		it('should accept a newRoot expression', () => {
			pipeline<User>().replaceRoot({ newRoot: '$address' });
		});

		it('should use explicit TOutput for downstream type tracking', () => {
			pipeline<User>()
				.replaceRoot<Address>({ newRoot: { $arrayElemAt: ['$address', 0] } })
				.sort({ city: 1 }); // 'city' is in Address
		});
	});

	describe('replaceWith', () => {
		it('should accept an expression', () => {
			pipeline<User>().replaceWith({ $arrayElemAt: ['$address', 0] });
		});

		it('should use explicit TOutput for downstream type tracking', () => {
			pipeline<User>()
				.replaceWith<Address>({ $arrayElemAt: ['$address', 0] })
				.sort({ city: 1 }); // 'city' is in Address
		});
	});

	describe('sortByCount', () => {
		it('should accept an expression', () => {
			pipeline<User>().sortByCount('$department');
		});

		it('should produce { _id, count } output schema', () => {
			const builder = pipeline<User>().sortByCount('$department');
			type T1 = Assert<Equals<typeof builder, PipelineBuilder<{ _id: string, count: number }>>>;
		});

		it('should allow sorting on count downstream', () => {
			pipeline<User>().sortByCount('$department').sort({ count: -1 });
		});
	});

	describe('facet', () => {
		it('should accept sub-pipeline builders via factory callback', () => {
			pipeline<User>().facet(p => ({
				byDept: p().group({ _id: '$department', total: { $sum: 1 } }),
				top10: p().sort({ score: -1 }).limit(10)
			}));
		});

		it('should infer element type from sub-pipeline output schema', () => {
			const builder = pipeline<User>().facet(p => ({
				byDept: p().group({ _id: '$department', total: { $sum: 1 } })
			}));
			type T1 = Assert<Equals<typeof builder, PipelineBuilder<{ byDept: { _id: string, total: number }[] }>>>;
		});
	});

	// -------------------------------------------------------------------------
	// Terminal methods
	// -------------------------------------------------------------------------

	describe('out', () => {
		it('should accept a collection name string', () => {
			const stages = pipeline<User>().match({ active: true }).out('archive');
			assert.deepEqual(stages, [{ $match: { active: true } }, { $out: 'archive' }]);
		});

		it('should accept a db+coll object', () => {
			const stages = pipeline<User>().out({ coll: 'archive', db: 'reporting' });
			assert.deepEqual(stages, [{ $out: { coll: 'archive', db: 'reporting' } }]);
		});
	});

	describe('merge', () => {
		it('should accept a merge spec', () => {
			const stages = pipeline<User>()
				.match({ active: true })
				.merge({ into: 'archive', whenNotMatched: 'insert' });
			assert.deepEqual(stages, [
				{ $match: { active: true } },
				{ $merge: { into: 'archive', whenNotMatched: 'insert' } }
			]);
		});
	});

	// -------------------------------------------------------------------------
	// Chaining across multiple schema transformations
	// -------------------------------------------------------------------------

	describe('chaining', () => {
		it('should support multi-step chains with schema tracking', () => {
			// match (User) → group (GroupOutput) → sort (GroupOutput) → limit → merge
			const stages = pipeline<User>()
				.match({ active: true })
				.group({ _id: '$department', headcount: { $sum: 1 } })
				.sort({ headcount: -1 })
				.limit(5)
				.merge({ into: 'summary' });

			assert.deepEqual(stages, [
				{ $match: { active: true } },
				{ $group: { _id: '$department', headcount: { $sum: 1 } } },
				{ $sort: { headcount: -1 } },
				{ $limit: 5 },
				{ $merge: { into: 'summary' } }
			]);
		});

		it('should support unwind → match chain on element type', () => {
			// After unwind('$tags'), tags is string. Match on tags as string.
			pipeline<User>()
				.unwind('$tags')
				.match({ tags: 'typescript' }); // tags is now string, not string[]
		});

		it('should support lookup → group chain on joined schema', () => {
			pipeline<User>()
				.lookup<Order, 'orders'>({ as: 'orders', foreignField: 'userId', from: 'orders', localField: 'email' })
				.group({ _id: '$department', orderCount: { $sum: { $size: '$orders' } } });
		});
	});

	// -------------------------------------------------------------------------
	// Extensibility — subclass via create() override
	// -------------------------------------------------------------------------

	describe('extensibility', () => {
		class TestBuilder<TInput extends object> extends PipelineBuilder<TInput> {
			readonly custom = true;

			protected override create<T extends object>(stages: object[]): TestBuilder<T> {
				return new TestBuilder<T>(stages);
			}

			getStages(): object[] {
				return [...this.stages];
			}
		}

		it('should return subclass instance through schema-preserving methods', () => {
			const builder = new TestBuilder<User>();
			const result = builder.match({ active: true });
			assert.equal((result as any).custom, true);
		});

		it('should return subclass instance through schema-transforming methods', () => {
			const builder = new TestBuilder<User>();
			const result = builder.group({ _id: '$department', total: { $sum: 1 } });
			assert.equal((result as any).custom, true);
		});

		it('should return subclass instance through multi-step chains', () => {
			const builder = new TestBuilder<User>();
			const result = builder
				.match({ active: true })
				.group({ _id: '$department', total: { $sum: 1 } })
				.sort({ total: -1 })
				.limit(10);
			assert.equal((result as any).custom, true);
		});

		it('should use create() for facet sub-pipeline factory', () => {
			const builder = new TestBuilder<User>();
			let isSubPipelineTestBuilder = false;
			builder.facet((p) => {
				const sub = p();
				isSubPipelineTestBuilder = (sub as any).custom === true;
				return { branch: sub.match({ active: true }) };
			});
			assert.equal(isSubPipelineTestBuilder, true);
		});

		it('should still accumulate correct stages', () => {
			const builder = new TestBuilder<User>()
				.match({ active: true })
				.sort({ name: 1 }) as TestBuilder<User>;
			assert.deepEqual(builder.getStages(), [
				{ $match: { active: true } },
				{ $sort: { name: 1 } }
			]);
		});
	});
});
