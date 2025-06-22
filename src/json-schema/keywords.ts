export type AnyKeywords =
	| '$comment'
	| '$id'
	| '$schema'
	| 'allOf'
	| 'anyOf'
	| 'bsonType'
	| 'default'
	| 'description'
	| 'enum'
	| 'not'
	| 'oneOf'
	| 'title'
	| 'type';

export type ArrayKeywords =
	| 'additionalItems'
	| 'contains'
	| 'items'
	| 'maxItems'
	| 'minItems'
	| 'uniqueItems';

export type NumberKeywords =
	| 'exclusiveMaximum'
	| 'exclusiveMinimum'
	| 'maximum'
	| 'minimum'
	| 'multipleOf';

export type ObjectKeywords =
	| 'additionalProperties'
	| 'dependencies'
	| 'maxProperties'
	| 'minProperties'
	| 'patternProperties'
	| 'properties'
	| 'required';

export type StringKeywords =
	| 'format'
	| 'maxLength'
	| 'minLength'
	| 'pattern';
