/* eslint-disable @typescript-eslint/no-unused-vars */
import { Filter } from '../../src/index.js';

interface User {
	_id: string,
	age: number,
	isHuman?: boolean,
	name: string,
	tags: string[]
}

// Matches users who are either under 18 or over 60
const filter9: Filter<User> = {
	$or: [
		{ age: { $lt: 18 } },
		{ age: { $gt: 60 } }
	]
};

// Matches users whose name starts with "A" and are human
const filter10: Filter<User> = {
	$and: [
		{ name: { $regex: '^A' } },
		{ isHuman: true }
	]
};
