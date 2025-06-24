/* eslint-disable @typescript-eslint/no-unused-vars */
import { Update } from '../../src/index.js';

interface User {
	_id: string,
	age: number,
	name: string,
	roles: {
		level: number,
		name: string
	}[]
}

// Increment values
const updateInc: Update<User> = {
	$inc: {
		// Increments age by 1
		'age': 1,
		// Increments second role's level
		'roles.1.level': 2
	}
};

// Multiply values
const updateMul: Update<User> = {
	$mul: {
		// Doubles the age
		'age': 2,
		// Triples the level of first role
		'roles.0.level': 3
	}
};

// Set minimum values
const updateMin: Update<User> = {
	$min: {
		// Ensures age is at least 18
		age: 18
	}
};

// Set maximum values
const updateMax: Update<User> = {
	$max: {
		// Caps age at 65
		age: 65
	}
};
