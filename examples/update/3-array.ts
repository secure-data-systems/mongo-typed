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

// Push elements to arrays
const updatePush: Update<User> = {
	$push: {
		roles: {
			// Push a new role object
			level: 1, name: 'supervisor'
		},
		// Push multiple tags
		tags: { $each: ['admin', 'moderator'] }
	}
};

// Add only unique elements
const updateAddToSet: Update<User> = {
	$addToSet: {
		// Add only if not already present
		tags: { $each: ['editor', 'admin'] }
	}
};

// Pull elements from arrays
const updatePull: Update<User> = {
	$pull: {
		// Remove roles with name "deprecated"
		roles: { name: 'deprecated' },
		// Remove tag
		tags: 'admin'
	}
};

// Remove first/last item
const updatePop: Update<User> = {
	$pop: {
		// Remove first element
		tags: -1
	}
};
