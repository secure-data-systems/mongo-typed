export type GeoJson =
	| GeoJsonMultiPolygon
	| GeoJsonPoint
	| GeoJsonPolygon
	| { coordinates: [number, number][], type: 'LineString' }
	| { coordinates: [number, number][], type: 'MultiPoint' }
	| { coordinates: [number, number][][], type: 'MultiLineString' }
	| { geometries: GeoJson[], type: 'GeometryCollection' };

export interface GeoJsonMultiPolygon {
	coordinates: [number, number][][][],
	type: 'MultiPolygon'
}

export interface GeoJsonPoint {
	coordinates: [number, number],
	type: 'Point'
}

export interface GeoJsonPolygon {
	coordinates: [number, number][][],
	type: 'Polygon'
}
