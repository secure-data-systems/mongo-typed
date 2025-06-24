/* eslint-disable @typescript-eslint/no-unused-vars */
import { Filter } from '../../src/index.js';

interface Role {
	name: string,
	position: number
}

interface User {
	_id: string,
	age: number,
	roles?: Role[],
	tags: string[]
}

// Finds users whose age is between 18 and 65 (inclusive lower bound, exclusive upper bound)
const filter4: Filter<User> = {
	age: { $gte: 18, $lt: 65 }
};

// Finds users whose tags include either "admin" or "dev"
const filter5: Filter<User> = {
	tags: { $in: ['admin', 'dev'] }
};

// Finds users who have any role with position > 0
const filter6: Filter<User> = {
	'roles.position': { $gt: 0 }
};
