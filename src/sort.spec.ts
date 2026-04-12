/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it } from 'node:test';

import type { ObjSort } from './sort.js';
import type { Assert, Includes } from './types.js';

interface Address {
	city: string,
	zip: number
}

interface User {
	address: Address,
	age: number,
	name: string,
	score: number
}

// ---------------------------------------------------------------------------
// ObjSort
// ---------------------------------------------------------------------------

describe('ObjSort', () => {
	it('should accept valid field paths with direction', () => {
		type T1 = Assert<Includes<ObjSort<User>, { name?: -1 | 1 | { $meta: string } }>>;
	});

	it('should accept nested dot-notation fields', () => {
		type T1 = Assert<Includes<ObjSort<User>, { 'address.city'?: -1 | 1 | { $meta: string } }>>;
	});
});
