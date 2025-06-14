/* eslint-disable @typescript-eslint/no-unused-vars */
import { Filter } from '../src/index.js';

interface User {
	_id: string,
	age: number,
	email: string,
	roles: string[]
}

const query: Filter<User> = {
	$or: [
		{ email: /@example\.com$/ },
		{ email: { $exists: false } }
	],
	age: { $gte: 18 },
	roles: { $in: ['admin', 'user'] }
};
