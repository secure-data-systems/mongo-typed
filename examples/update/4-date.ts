/* eslint-disable @typescript-eslint/no-unused-vars */
import { Update } from '../../src/index.js';

interface User {
	_id: string,
	address?: {
		city: string,
		zip?: number
	},
	name: string
}

// Set date fields to current date
const updateCurrentDate: Update<User> = {
	$currentDate: {
		'address.updatedAt': true // If `updatedAt` exists in address
	}
};
