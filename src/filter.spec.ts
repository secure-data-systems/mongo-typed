/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it } from 'node:test';

import type { Assert, Equals, Includes, Not } from './types.js';

import { Condition, Filter, NearFilter } from './filter.js';
import { GeoJson, GeoJsonMultiPolygon, GeoJsonPoint, GeoJsonPolygon } from './geo-json.js';

interface Role {
	bits: number[],
	flags: number,
	name: string,
	position: number
}

// Example schemas for testing
interface User {
	_id: string,
	address: {
		city?: string,
		location: GeoJsonPoint,
		region: GeoJsonPolygon,
		tupleLocation: [],
		zip: number,
		zones: GeoJsonMultiPolygon
	},
	age: number,
	isHuman?: boolean,
	name: string,
	roles?: Role[],
	tags: string[]
}

describe('Filter', () => {
	describe('$and', () => {
		it('should support $and operator', () => {
			type Actual = Filter<User>['$and'];
			type Expected = Filter<User>[];

			type T1 = Assert<Equals<Expected | undefined, Actual>>;
		});
	});

	describe('$all', () => {
		it('should allow $all for arrays', () => {
			type StringActual = Filter<User>['tags'];
			type ObjectActual = Filter<User>['roles'];
			type NumberActual = Filter<User>['roles.bits'];

			type T1 = Assert<Includes<StringActual, { $all: string[] }>>;
			type T2 = Assert<Includes<ObjectActual, { $all: Role[] }>>;
			type T3 = Assert<Includes<NumberActual, { $all: number[] }>>;
		});

		it('should NOT allow $all for non arrays', () => {
			type StringActual = Filter<User>['name'];
			type ObjectActual = Filter<User>['address'];
			type NumberActual = Filter<User>['age'];
			type BooleanActual = Filter<User>['isHuman'];

			type T1 = Assert<Not<Includes<StringActual, { $all: string[] }>>>;
			type T2 = Assert<Not<Includes<ObjectActual, { $all: User['address'][] }>>>;
			type T3 = Assert<Not<Includes<NumberActual, { $all: number[] }>>>;
			type T4 = Assert<Not<Includes<BooleanActual, { $all: boolean[] }>>>;
		});
	});

	describe('$bitsAllClear', () => {
		it('should allow bitwise operators on number field', () => {
			type Actual = Filter<User>['roles.flags'];

			type T1 = Assert<Includes<Actual, { $bitsAllClear: number }>>;
		});

		it('should only allow bitwise operators on integer fields', () => {
			type ActualArray = Filter<User>['roles.bits'];
			type ActualString = Filter<User>['name'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];

			type T1 = Assert<Not<Includes<ActualArray, { $bitsAllClear: number }>>>;
			type T2 = Assert<Not<Includes<ActualString, { $bitsAllClear: number }>>>;
			type T3 = Assert<Not<Includes<ActualBoolean, { $bitsAllClear: number }>>>;
			type T4 = Assert<Not<Includes<ActualObject, { $bitsAllClear: number }>>>;
		});
	});

	describe('$bitsAllSet', () => {
		it('should allow bitwise operators on number field', () => {
			type Actual = Filter<User>['roles.flags'];

			type T1 = Assert<Includes<Actual, { $bitsAllSet: number }>>;
		});

		it('should only allow bitwise operators on integer fields', () => {
			type ActualArray = Filter<User>['roles.bits'];
			type ActualString = Filter<User>['name'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];

			type T1 = Assert<Not<Includes<ActualArray, { $bitsAllSet: number }>>>;
			type T2 = Assert<Not<Includes<ActualString, { $bitsAllSet: number }>>>;
			type T3 = Assert<Not<Includes<ActualBoolean, { $bitsAllSet: number }>>>;
			type T4 = Assert<Not<Includes<ActualObject, { $bitsAllSet: number }>>>;
		});
	});

	describe('$bitsAnyClear', () => {
		it('should allow bitwise operators on number field', () => {
			type Actual = Filter<User>['roles.flags'];

			type T1 = Assert<Includes<Actual, { $bitsAnyClear: number }>>;
		});

		it('should only allow bitwise operators on integer fields', () => {
			type ActualArray = Filter<User>['roles.bits'];
			type ActualString = Filter<User>['name'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];

			type T1 = Assert<Not<Includes<ActualArray, { $bitsAnyClear: number }>>>;
			type T2 = Assert<Not<Includes<ActualString, { $bitsAnyClear: number }>>>;
			type T3 = Assert<Not<Includes<ActualBoolean, { $bitsAnyClear: number }>>>;
			type T4 = Assert<Not<Includes<ActualObject, { $bitsAnyClear: number }>>>;
		});
	});

	describe('$bitsAnySet', () => {
		it('should allow bitwise operators on number field', () => {
			type Actual = Filter<User>['roles.flags'];

			type T1 = Assert<Includes<Actual, { $bitsAnySet: number }>>;
		});

		it('should only allow bitwise operators on integer fields', () => {
			type ActualArray = Filter<User>['roles.bits'];
			type ActualString = Filter<User>['name'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];

			type T1 = Assert<Not<Includes<ActualArray, { $bitsAnySet: number }>>>;
			type T2 = Assert<Not<Includes<ActualString, { $bitsAnySet: number }>>>;
			type T3 = Assert<Not<Includes<ActualBoolean, { $bitsAnySet: number }>>>;
			type T4 = Assert<Not<Includes<ActualObject, { $bitsAnySet: number }>>>;
		});
	});

	describe('$elemMatch', () => {
		it('should allow $elemMatch for array of primitive arrays', () => {
			type Actual = Filter<User>['tags'];

			type T1 = Assert<Includes<Actual, { $elemMatch: Condition<string> }>>;
		});

		it('should allow $elemMatch for array of object arrays', () => {
			type Actual = Filter<User>['roles'];

			type T1 = Assert<Includes<Actual, { $elemMatch: Filter<Role> }>>;
		});
	});

	describe('$eq', () => {
		it('should allow direct equality condition on primitive fields', () => {
			type ActualString = Filter<User>['name'];
			type ActualNumber = Filter<User>['age'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];

			type T1 = Assert<Includes<ActualString, string>>;
			type T2 = Assert<Includes<ActualString, RegExp>>;

			type T4 = Assert<Not<Includes<ActualString, number>>>;
			type T5 = Assert<Not<Includes<ActualString, boolean>>>;
			type T6 = Assert<Not<Includes<ActualString, User['address']>>>;

			type T7 = Assert<Includes<ActualNumber, number>>;
			type T9 = Assert<Not<Includes<ActualNumber, string>>>;
			type T10 = Assert<Not<Includes<ActualNumber, boolean>>>;
			type T11 = Assert<Not<Includes<ActualNumber, User['address']>>>;

			type T12 = Assert<Includes<ActualBoolean, boolean>>;
			type T14 = Assert<Not<Includes<ActualBoolean, string>>>;
			type T15 = Assert<Not<Includes<ActualBoolean, number>>>;
			type T16 = Assert<Not<Includes<ActualBoolean, User['address']>>>;

			type T17 = Assert<Includes<ActualObject, User['address']>>;
			type T19 = Assert<Not<Includes<ActualObject, string>>>;
			type T20 = Assert<Not<Includes<ActualObject, number>>>;
			type T21 = Assert<Not<Includes<ActualObject, boolean>>>;
		});

		it('should allow dot notation for nested object field', () => {
			type ActualString = Filter<User>['address.city'];
			type ActualNumber = Filter<User>['address.zip'];

			type T1 = Assert<Includes<ActualString, string>>;
			type T2 = Assert<Includes<ActualString, RegExp>>;

			type T4 = Assert<Not<Includes<ActualString, number>>>;
			type T5 = Assert<Not<Includes<ActualString, boolean>>>;
			type T6 = Assert<Not<Includes<ActualString, User['address']>>>;

			type T7 = Assert<Includes<ActualNumber, number>>;

			type T9 = Assert<Not<Includes<ActualNumber, string>>>;
			type T10 = Assert<Not<Includes<ActualNumber, boolean>>>;
			type T11 = Assert<Not<Includes<ActualNumber, User['address']>>>;
		});

		it('should allow $eq operator for all fields', () => {
			type ActualString = Filter<User>['name'];
			type ActualNumber = Filter<User>['age'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];

			type T1 = Assert<Includes<ActualString, { $eq: string }>>;
			type T2 = Assert<Not<Includes<ActualString, { $eq: RegExp }>>>;
			type T4 = Assert<Not<Includes<ActualString, { $eq: number }>>>;
			type T5 = Assert<Not<Includes<ActualString, { $eq: boolean }>>>;
			type T6 = Assert<Not<Includes<ActualString, { $eq: User['address'] }>>>;

			type T8 = Assert<Includes<ActualNumber, { $eq: number }>>;
			type T9 = Assert<Not<Includes<ActualNumber, { $eq: string }>>>;
			type T10 = Assert<Not<Includes<ActualNumber, { $eq: boolean }>>>;
			type T11 = Assert<Not<Includes<ActualNumber, { $eq: User['address'] }>>>;

			type T13 = Assert<Includes<ActualBoolean, { $eq: boolean }>>;
			type T14 = Assert<Not<Includes<ActualBoolean, { $eq: string }>>>;
			type T15 = Assert<Not<Includes<ActualBoolean, { $eq: number }>>>;
			type T16 = Assert<Not<Includes<ActualBoolean, { $eq: User['address'] }>>>;

			type T18 = Assert<Includes<ActualObject, { $eq: User['address'] }>>;
			type T19 = Assert<Not<Includes<ActualObject, { $eq: string }>>>;
			type T20 = Assert<Not<Includes<ActualObject, { $eq: number }>>>;
			type T21 = Assert<Not<Includes<ActualObject, { $eq: boolean }>>>;
		});
	});

	describe('$exists', () => {
		it('should allow $exists operator for all fields', () => {
			type ActualString = Filter<User>['name'];
			type ActualNumber = Filter<User>['age'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];

			type T1 = Assert<Includes<ActualString, { $exists: true }>>;
			type T2 = Assert<Includes<ActualString, { $exists: false }>>;
			type T3 = Assert<Includes<ActualNumber, { $exists: true }>>;
			type T4 = Assert<Includes<ActualNumber, { $exists: false }>>;
			type T5 = Assert<Includes<ActualBoolean, { $exists: true }>>;
			type T6 = Assert<Includes<ActualBoolean, { $exists: false }>>;
			type T7 = Assert<Includes<ActualObject, { $exists: true }>>;
			type T8 = Assert<Includes<ActualObject, { $exists: false }>>;
		});
	});

	describe('$geoIntersects', () => {
		it('should allow $geoIntersects on GeoJSON fields', () => {
			type Actual = Filter<User>['address.location'];

			interface Expect { $geoIntersects: { $geometry: GeoJson } }

			type T1 = Assert<Includes<Actual, Expect>>;
		});

		it('should NOT allow $geoIntersects on non-geo field', () => {
			type Actual = Filter<User>['name'];

			type T1 = Assert<Not<Includes<Actual, { $geoIntersects: { $geometry: GeoJson } }>>>;
		});
	});

	describe('$geoWithin', () => {
		it('should allow $geoWithin on Polygon field', () => {
			type Actual = Filter<User>['address.region'];
			interface Expect { $geoWithin: GeoJsonMultiPolygon | GeoJsonPolygon }
			type T1 = Assert<Includes<Actual, Expect>>;
		});

		it('should allow $geoWithin on MultiPolygon field', () => {
			type Actual = Filter<User>['address.zones'];
			interface Expect { $geoWithin: GeoJsonMultiPolygon | GeoJsonPolygon }
			type T1 = Assert<Includes<Actual, Expect>>;
		});

		it('should NOT allow $geoWithin on non-geo field', () => {
			type Actual = Filter<User>['name'];

			type T1 = Assert<Not<Includes<Actual, { $geoWithin: GeoJsonPolygon }>>>;
		});
	});

	describe('$gt', () => {
		it('should allow $gt operator for all fields', () => {
			type ActualString = Filter<User>['name'];
			type ActualNumber = Filter<User>['age'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];

			type T1 = Assert<Includes<ActualString, { $gt: string }>>;
			type T4 = Assert<Not<Includes<ActualString, { $gt: number }>>>;
			type T5 = Assert<Not<Includes<ActualString, { $gt: boolean }>>>;
			type T6 = Assert<Not<Includes<ActualString, { $gt: User['address'] }>>>;

			type T8 = Assert<Includes<ActualNumber, { $gt: number }>>;
			type T9 = Assert<Not<Includes<ActualNumber, { $gt: string }>>>;
			type T10 = Assert<Not<Includes<ActualNumber, { $gt: boolean }>>>;
			type T11 = Assert<Not<Includes<ActualNumber, { $gt: User['address'] }>>>;

			type T13 = Assert<Includes<ActualBoolean, { $gt: boolean }>>;
			type T14 = Assert<Not<Includes<ActualBoolean, { $gt: string }>>>;
			type T15 = Assert<Not<Includes<ActualBoolean, { $gt: number }>>>;
			type T16 = Assert<Not<Includes<ActualBoolean, { $gt: User['address'] }>>>;

			type T18 = Assert<Includes<ActualObject, { $gt: User['address'] }>>;
			type T19 = Assert<Not<Includes<ActualObject, { $gt: string }>>>;
			type T20 = Assert<Not<Includes<ActualObject, { $gt: number }>>>;
			type T21 = Assert<Not<Includes<ActualObject, { $gt: boolean }>>>;
		});
	});

	describe('$gte', () => {
		it('should allow $gte operator for all fields', () => {
			type ActualString = Filter<User>['name'];
			type ActualNumber = Filter<User>['age'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];

			type T1 = Assert<Includes<ActualString, { $gte: string }>>;
			type T4 = Assert<Not<Includes<ActualString, { $gte: number }>>>;
			type T5 = Assert<Not<Includes<ActualString, { $gte: boolean }>>>;
			type T6 = Assert<Not<Includes<ActualString, { $gte: User['address'] }>>>;

			type T8 = Assert<Includes<ActualNumber, { $gte: number }>>;
			type T9 = Assert<Not<Includes<ActualNumber, { $gte: string }>>>;
			type T10 = Assert<Not<Includes<ActualNumber, { $gte: boolean }>>>;
			type T11 = Assert<Not<Includes<ActualNumber, { $gte: User['address'] }>>>;

			type T13 = Assert<Includes<ActualBoolean, { $gte: boolean }>>;
			type T14 = Assert<Not<Includes<ActualBoolean, { $gte: string }>>>;
			type T15 = Assert<Not<Includes<ActualBoolean, { $gte: number }>>>;
			type T16 = Assert<Not<Includes<ActualBoolean, { $gte: User['address'] }>>>;

			type T18 = Assert<Includes<ActualObject, { $gte: User['address'] }>>;
			type T19 = Assert<Not<Includes<ActualObject, { $gte: string }>>>;
			type T20 = Assert<Not<Includes<ActualObject, { $gte: number }>>>;
			type T21 = Assert<Not<Includes<ActualObject, { $gte: boolean }>>>;
		});
	});

	describe('$in', () => {
		it('should allow $in operator for primitive fields', () => {
			type ActualString = Filter<User>['name'];
			type ActualNumber = Filter<User>['age'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];

			type T1 = Assert<Includes<ActualString, { $in: string[] }>>;
			type T2 = Assert<Includes<ActualNumber, { $in: number[] }>>;
			type T3 = Assert<Includes<ActualBoolean, { $in: boolean[] }>>;
			type T4 = Assert<Includes<ActualObject, { $in: User['address'][] }>>;
		});
	});

	describe('$jsonSchema', () => {
		it('should allow $jsonSchema with bsonType string', () => {
			type Actual = Filter<User>['name'];

			type T1 = Assert<Includes<Actual, {
				$jsonSchema: { bsonType: 'string' }
			}>>;
		});

		it('should allow $jsonSchema with bsonType array', () => {
			type Actual = Filter<User>['tags'];

			type T1 = Assert<Includes<Actual, {
				$jsonSchema: { bsonType: ['array'] }
			}>>;
		});

		it('should allow $jsonSchema with properties', () => {
			type Actual = Filter<User>['name'];

			type T1 = Assert<Includes<Actual, {
				$jsonSchema: {
					bsonType: 'object',
					properties: {
						username: { bsonType: 'string', minLength: 3 }
					},
					required: ['username']
				}
			}>>;
		});

		it('should allow $jsonSchema with nested items for arrays', () => {
			type Actual = Filter<User>['tags'];

			type T1 = Assert<Includes<Actual, {
				$jsonSchema: {
					bsonType: 'array',
					items: { bsonType: 'string' },
					minItems: 1
				}
			}>>;
		});

		it('should NOT allow $jsonSchema with unsupported keywords like const', () => {
			type Actual = Filter<User>['name'];

			type T1 = Assert<Not<Includes<Actual, {
				$jsonSchema: {
					const: 'admin'
				}
			}>>>;
		});
	});

	describe('$lt', () => {
		it('should allow $lt operator for all fields', () => {
			type ActualString = Filter<User>['name'];
			type ActualNumber = Filter<User>['age'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];

			type T1 = Assert<Includes<ActualString, { $lt: string }>>;
			type T4 = Assert<Not<Includes<ActualString, { $lt: number }>>>;
			type T5 = Assert<Not<Includes<ActualString, { $lt: boolean }>>>;
			type T6 = Assert<Not<Includes<ActualString, { $lt: User['address'] }>>>;

			type T8 = Assert<Includes<ActualNumber, { $lt: number }>>;
			type T9 = Assert<Not<Includes<ActualNumber, { $lt: string }>>>;
			type T10 = Assert<Not<Includes<ActualNumber, { $lt: boolean }>>>;
			type T11 = Assert<Not<Includes<ActualNumber, { $lt: User['address'] }>>>;

			type T13 = Assert<Includes<ActualBoolean, { $lt: boolean }>>;
			type T14 = Assert<Not<Includes<ActualBoolean, { $lt: string }>>>;
			type T15 = Assert<Not<Includes<ActualBoolean, { $lt: number }>>>;
			type T16 = Assert<Not<Includes<ActualBoolean, { $lt: User['address'] }>>>;

			type T18 = Assert<Includes<ActualObject, { $lt: User['address'] }>>;
			type T19 = Assert<Not<Includes<ActualObject, { $lt: string }>>>;
			type T20 = Assert<Not<Includes<ActualObject, { $lt: number }>>>;
			type T21 = Assert<Not<Includes<ActualObject, { $lt: boolean }>>>;
		});
	});

	describe('$lte', () => {
		it('should allow $lte operator for all fields', () => {
			type ActualString = Filter<User>['name'];
			type ActualNumber = Filter<User>['age'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];

			type T1 = Assert<Includes<ActualString, { $lte: string }>>;
			type T4 = Assert<Not<Includes<ActualString, { $lte: number }>>>;
			type T5 = Assert<Not<Includes<ActualString, { $lte: boolean }>>>;
			type T6 = Assert<Not<Includes<ActualString, { $lte: User['address'] }>>>;

			type T8 = Assert<Includes<ActualNumber, { $lte: number }>>;
			type T9 = Assert<Not<Includes<ActualNumber, { $lte: string }>>>;
			type T10 = Assert<Not<Includes<ActualNumber, { $lte: boolean }>>>;
			type T11 = Assert<Not<Includes<ActualNumber, { $lte: User['address'] }>>>;

			type T13 = Assert<Includes<ActualBoolean, { $lte: boolean }>>;
			type T14 = Assert<Not<Includes<ActualBoolean, { $lte: string }>>>;
			type T15 = Assert<Not<Includes<ActualBoolean, { $lte: number }>>>;
			type T16 = Assert<Not<Includes<ActualBoolean, { $lte: User['address'] }>>>;

			type T18 = Assert<Includes<ActualObject, { $lte: User['address'] }>>;
			type T19 = Assert<Not<Includes<ActualObject, { $lte: string }>>>;
			type T20 = Assert<Not<Includes<ActualObject, { $lte: number }>>>;
			type T21 = Assert<Not<Includes<ActualObject, { $lte: boolean }>>>;
		});
	});

	describe('$maxDistance', () => {
		it('should allow $maxDistance on GeoJsonPoint', () => {
			type Actual = Filter<User>['address.location'];
			type T1 = Assert<Includes<Actual, { $maxDistance: number }>>;
		});

		it('should allow $maxDistance on [number, number]', () => {
			type Actual = Filter<User>['address.location.coordinates'];
			type T1 = Assert<Includes<Actual, { $maxDistance: number }>>;
		});

		it('should NOT allow $maxDistance on string field', () => {
			type Actual = Filter<User>['name'];

			type T1 = Assert<Not<Includes<Actual, { $maxDistance: [number, number] }>>>;
			type T2 = Assert<Not<Includes<Actual, { $maxDistance: NearFilter }>>>;
		});
	});

	describe('$minDistance', () => {
		it('should allow $minDistance on GeoJsonPoint', () => {
			type Actual = Filter<User>['address.location'];
			type T1 = Assert<Includes<Actual, { $minDistance: number }>>;
		});

		it('should allow $minDistance on [number, number]', () => {
			type Actual = Filter<User>['address.location.coordinates'];
			type T1 = Assert<Includes<Actual, { $minDistance: number }>>;
		});

		it('should NOT allow $minDistance on string field', () => {
			type Actual = Filter<User>['name'];

			type T1 = Assert<Not<Includes<Actual, { $minDistance: [number, number] }>>>;
			type T2 = Assert<Not<Includes<Actual, { $minDistance: NearFilter }>>>;
		});
	});

	describe('$mod', () => {
		it('should allow $mod on numeric fields', () => {
			type Actual = Filter<User>['age'];

			type T1 = Assert<Includes<Actual, { $mod: [number, number] }>>;
		});

		it('should NOT allow $mod on non-numeric fields', () => {
			type ActualString = Filter<User>['name'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];

			type T1 = Assert<Not<Includes<ActualString, { $mod: [number, number] }>>>;
			type T2 = Assert<Not<Includes<ActualBoolean, { $mod: [number, number] }>>>;
			type T3 = Assert<Not<Includes<ActualObject, { $mod: [number, number] }>>>;
		});
	});

	describe('$ne', () => {
		it('should allow $ne operator for all fields', () => {
			type ActualString = Filter<User>['name'];
			type ActualNumber = Filter<User>['age'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];

			type T1 = Assert<Includes<ActualString, { $ne: string }>>;
			type T2 = Assert<Includes<ActualString, { $ne: RegExp }>>;

			type T4 = Assert<Not<Includes<ActualString, { $ne: number }>>>;
			type T5 = Assert<Not<Includes<ActualString, { $ne: boolean }>>>;
			type T6 = Assert<Not<Includes<ActualString, { $ne: User['address'] }>>>;

			type T8 = Assert<Includes<ActualNumber, { $ne: number }>>;
			type T9 = Assert<Not<Includes<ActualNumber, { $ne: string }>>>;
			type T10 = Assert<Not<Includes<ActualNumber, { $ne: boolean }>>>;
			type T11 = Assert<Not<Includes<ActualNumber, { $ne: User['address'] }>>>;

			type T13 = Assert<Includes<ActualBoolean, { $ne: boolean }>>;
			type T14 = Assert<Not<Includes<ActualBoolean, { $ne: string }>>>;
			type T15 = Assert<Not<Includes<ActualBoolean, { $ne: number }>>>;
			type T16 = Assert<Not<Includes<ActualBoolean, { $ne: User['address'] }>>>;

			type T18 = Assert<Includes<ActualObject, { $ne: User['address'] }>>;
			type T19 = Assert<Not<Includes<ActualObject, { $ne: string }>>>;
			type T20 = Assert<Not<Includes<ActualObject, { $ne: number }>>>;
			type T21 = Assert<Not<Includes<ActualObject, { $ne: boolean }>>>;
		});
	});

	describe('$near', () => {
		it('should allow $near on GeoJsonPoint', () => {
			type Actual = Filter<User>['address.location'];
			type T1 = Assert<Includes<Actual, { $near: NearFilter }>>;
		});

		it('should allow $near on [number, number]', () => {
			type Actual = Filter<User>['address.location.coordinates'];
			type T1 = Assert<Includes<Actual, { $near: [number, number] }>>;
		});

		it('should NOT allow $near on string field', () => {
			type Actual = Filter<User>['name'];

			type T1 = Assert<Not<Includes<Actual, { $near: [number, number] }>>>;
			type T2 = Assert<Not<Includes<Actual, { $near: NearFilter }>>>;
		});
	});

	describe('$near', () => {
		it('should allow $nearSphere on GeoJsonPoint', () => {
			type Actual = Filter<User>['address.location'];
			type T4 = Assert<Includes<Actual, { $nearSphere: NearFilter }>>;
		});

		it('should NOT allow $nearSphere on [number, number]', () => {
			type Actual = Filter<User>['address.location.coordinates'];

			type T1 = Assert<Not<Includes<Actual, { $nearSphere: [number, number] }>>>;
			type T2 = Assert<Not<Includes<Actual, { $nearSphere: NearFilter }>>>;
		});

		it('should NOT allow $nearSphere on string', () => {
			type Actual = Filter<User>['name'];

			type T1 = Assert<Not<Includes<Actual, { $nearSphere: [number, number] }>>>;
			type T2 = Assert<Not<Includes<Actual, { $nearSphere: NearFilter }>>>;
		});
	});

	describe('$nor', () => {
		it('should support $nor operator', () => {
			type Actual = Filter<User>['$nor'];
			type Expected = Filter<User>[];

			type T1 = Assert<Equals<Expected | undefined, Actual>>;
		});
	});

	describe('$not', () => {
		it('should allow $not with RegExp on string fields', () => {
			type Actual = Filter<User>['name'];
			type T1 = Assert<Includes<Actual, { $not: RegExp }>>;
		});

		it('should allow $not with FilterOperators on string fields', () => {
			type Actual = Filter<User>['name'];
			type T1 = Assert<Includes<Actual, { $not: { $regex: RegExp } }>>;
		});

		it('should allow $not with FilterOperators on number fields', () => {
			type Actual = Filter<User>['age'];
			type T1 = Assert<Includes<Actual, { $not: { $gt: number } }>>;
		});

		it('should NOT allow RegExp in $not on non-string fields', () => {
			type ActualNumber = Filter<User>['age'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];
			type ActualArray = Filter<User>['roles'];

			type T1 = Assert<Not<Includes<ActualNumber, { $not: RegExp }>>>;
			type T2 = Assert<Not<Includes<ActualBoolean, { $not: RegExp }>>>;
			type T3 = Assert<Not<Includes<ActualObject, { $not: RegExp }>>>;
			type T4 = Assert<Not<Includes<ActualArray, { $not: RegExp }>>>;
		});

		it('should allow $not with FilterOperators on object fields', () => {
			type Actual = Filter<User>['address'];
			type T6 = Assert<Includes<Actual, { $not: { $exists: boolean } }>>;
		});
	});

	describe('$options', () => {
		it('should allow $options on string fields', () => {
			type Actual = Filter<User>['name'];
			type T1 = Assert<Includes<Actual, { $options: string }>>;
		});

		it('should NOT allow $options on non-string fields', () => {
			type ActualNumber = Filter<User>['age'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];
			type ActualArray = Filter<User>['roles'];

			type T1 = Assert<Not<Includes<ActualNumber, { $options: string }>>>;
			type T2 = Assert<Not<Includes<ActualBoolean, { $options: string }>>>;
			type T3 = Assert<Not<Includes<ActualObject, { $options: string }>>>;
			type T4 = Assert<Not<Includes<ActualArray, { $options: string }>>>;
		});
	});

	describe('$or', () => {
		it('should support $or operator', () => {
			type Actual = Filter<User>['$or'];
			type Expected = Filter<User>[];

			type T1 = Assert<Equals<Expected | undefined, Actual>>;
		});
	});

	describe('$rand', () => {
		it('should allow $rand on any field', () => {
			type ActualString = Filter<User>['name'];
			type ActualNumber = Filter<User>['age'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];
			type ActualArray = Filter<User>['roles'];

			type T1 = Assert<Includes<ActualString, { $rand: Record<string, never> }>>;
			type T2 = Assert<Includes<ActualNumber, { $rand: Record<string, never> }>>;
			type T3 = Assert<Includes<ActualBoolean, { $rand: Record<string, never> }>>;
			type T4 = Assert<Includes<ActualObject, { $rand: Record<string, never> }>>;
			type T5 = Assert<Includes<ActualArray, { $rand: Record<string, never> }>>;
		});
	});

	describe('$regex', () => {
		it('should allow regex for string fields', () => {
			type Actual = Filter<User>['name'];

			type T1 = Assert<Includes<Actual, RegExp | { $regex: RegExp | string }>>;

			type T2 = Assert<Not<Includes<Actual, number>>>;
			type T3 = Assert<Not<Includes<Actual, boolean>>>;
			type T4 = Assert<Not<Includes<Actual, User['address']>>>;
		});

		it('should NOT allow regex for non-string fields', () => {
			type ActualNumber = Filter<User>['age'];
			type ActualArray = Filter<User>['tags'];
			type ActualObj = Filter<User>['address'];

			type T1 = Assert<Not<Includes<ActualNumber, { $regex: RegExp | string }>>>;
			type T2 = Assert<Not<Includes<ActualArray, { $regex: RegExp | string }>>>;
			type T3 = Assert<Not<Includes<ActualObj, { $regex: RegExp | string }>>>;
		});
	});

	describe('$size', () => {
		it('should allow $size on array fields', () => {
			type ActualArray = Filter<User>['tags'];
			type ActualOptionalArray = Filter<User>['tags'];

			type T1 = Assert<Includes<ActualArray, { $size: number }>>;
			type T2 = Assert<Includes<ActualOptionalArray, { $size: number }>>;
		});

		it('should NOT allow $size on non-array fields', () => {
			type ActualString = Filter<User>['name'];
			type ActualNumber = Filter<User>['age'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];

			type T1 = Assert<Not<Includes<ActualString, { $size: number }>>>;
			type T2 = Assert<Not<Includes<ActualNumber, { $size: number }>>>;
			type T3 = Assert<Not<Includes<ActualBoolean, { $size: number }>>>;
			type T4 = Assert<Not<Includes<ActualObject, { $size: number }>>>;
		});
	});

	describe('$type', () => {
		it('should allow numeric $type on any field', () => {
			type ActualString = Filter<User>['name'];
			type ActualNumber = Filter<User>['age'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];
			type ActualArray = Filter<User>['tags'];
			type ActualOptionalArray = Filter<User>['tags'];

			type T1 = Assert<Includes<ActualString, { $type: 2 }>>;
			type T2 = Assert<Includes<ActualNumber, { $type: 16 }>>;
			type T3 = Assert<Includes<ActualBoolean, { $type: 8 }>>;
			type T4 = Assert<Includes<ActualObject, { $type: 3 }>>;
			type T5 = Assert<Includes<ActualArray, { $type: 4 }>>;
			type T6 = Assert<Includes<ActualOptionalArray, { $type: 4 }>>;
		});

		it('should allow alias $type on any field', () => {
			type ActualString = Filter<User>['name'];
			type ActualNumber = Filter<User>['age'];
			type ActualBoolean = Filter<User>['isHuman'];
			type ActualObject = Filter<User>['address'];
			type ActualArray = Filter<User>['tags'];
			type ActualOptionalArray = Filter<User>['tags'];

			type T1 = Assert<Includes<ActualString, { $type: 'string' }>>;
			type T2 = Assert<Includes<ActualNumber, { $type: 'int' }>>;
			type T3 = Assert<Includes<ActualBoolean, { $type: 'bool' }>>;
			type T4 = Assert<Includes<ActualObject, { $type: 'object' }>>;
			type T5 = Assert<Includes<ActualArray, { $type: 'array' }>>;
			type T6 = Assert<Includes<ActualOptionalArray, { $type: 'array' }>>;
		});
	});
});
