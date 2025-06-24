/* eslint-disable @typescript-eslint/no-unused-vars */
import { Filter } from '../../src/index.js';

interface Role {
	bits: number[],
	flags: number,
	name: string,
	position: number
}

interface User {
	_id: string,
	name: string,
	roles?: Role[],
	tags: string[]
}

// Finds users whose `tags` array includes both "admin" and "editor"
const filter7: Filter<User> = {
	tags: { $all: ['admin', 'editor'] }
};

// Finds users with at least one role where:
// - flags has bit 2 set
// - name matches /admin/i (case-insensitive)
const filter8: Filter<User> = {
	roles: {
		$elemMatch: {
			flags: { $bitsAllSet: 2 },
			name: { $regex: /admin/i }
		}
	}
};
