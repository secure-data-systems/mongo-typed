/* eslint-disable @typescript-eslint/no-unused-vars */
import { Filter } from '../../src/index.js';

// Geo filter: Finds users near the specified point, within 5km
const geoFilter: Filter<{ location: { coordinates: [number, number], type: 'Point' } }> = {
	location: {
		$near: {
			$geometry: { coordinates: [-73.97, 40.77], type: 'Point' },
			$maxDistance: 5000
		}
	}
};
