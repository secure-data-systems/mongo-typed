/* eslint-disable @typescript-eslint/no-unused-vars */
import { Filter } from '../../src/index.js';

interface User {
	_id: string,
	address: {
		city?: string,
		zip: number
	},
	isHuman?: boolean,
	name: string
}

// Checks if the user's name is exactly "Alice"
const filter1: Filter<User> = {
	name: { $eq: 'Alice' }
};

// Checks if the user's address.city equals "New York"
const filter2: Filter<User> = {
	'address.city': 'New York'
};

// Checks if the user is human (true or undefined if optional)
const filter3: Filter<User> = {
	isHuman: true
};
