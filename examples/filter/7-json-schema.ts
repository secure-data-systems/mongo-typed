/* eslint-disable @typescript-eslint/no-unused-vars */
import { Filter } from '../../src/index.js';

interface User {
	_id: string,
	age: number,
	name: string
}

// Filters users that match the given JSON Schema (name must be string, age must be int ≥ 0)
const filter12: Filter<User> = {
	$jsonSchema: {
		bsonType: 'object',
		properties: {
			age: { bsonType: 'int', minimum: 0 },
			name: { bsonType: 'string' }
		},
		required: ['name', 'age']
	}
};
