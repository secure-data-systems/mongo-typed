/* eslint-disable @typescript-eslint/no-unused-vars */
import { Update } from '../../src/index.js';

interface User {
	_id: string,
	address?: {
		city: string,
		zip?: number
	},
	age: number,
	name: string,
	roles: {
		level: number,
		name: string
	}[],
	tags?: string[]
}

// Set fields
const updateSet: Update<User> = {
	$set: {
		// Nested optional field
		'address.city': 'New York',
		// Update top-level string field
		'name': 'Alice',
		// Specific index in array of objects
		'roles.0.level': 5
	}
};

// Remove fields
const updateUnset: Update<User> = {
	$unset: {
		// Removes nested number field
		'address.zip': true,
		// Removes entire array
		'tags': true
	}
};

// Rename fields
const updateRename: Update<User> = {
	$rename: {
		// Renames nested field
		'address.zip': 'address.postal',
		// Renames top-level field
		'name': 'fullName'
	}
};
