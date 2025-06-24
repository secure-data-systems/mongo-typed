/* eslint-disable @typescript-eslint/no-unused-vars */
import { Update } from '../../src/index.js';

interface User {
	_id: string,

	name: string,
	roles: {
		level: number,
		name: string
	}[]
}

// Bitwise operations (on numeric fields only)
const updateBitwise: Update<User> = {
	$bit: {
		'roles.0.level': { and: 4 } // Apply bitwise AND on level
	}
};
