import { FieldRef } from './expr.js';

type TestRef = FieldRef<User>;

interface User {
	address: {
		city: string,
		zip: number
	}[],
	email: string,
	name: string,
	tags: string[]
}
