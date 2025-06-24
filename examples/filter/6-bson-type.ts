/* eslint-disable @typescript-eslint/no-unused-vars */
import { Filter } from '../../src/index.js';

interface User {
	_id: string,
	name: string
}

// Filters users where _id is of BSON ObjectId type
const filter11: Filter<User> = {
	_id: { $type: 'objectId' }
};
