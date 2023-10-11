import {
	limitPageValidator,
	stringQueryBodyValidator,
	uuidValidator,
} from './reusable';

export const propertyTypeUUID = [
	...uuidValidator({
		msg: 'Invalid uuid value for property type query param',
		queryString: false,
		targetField: 'id',
		optional: false,
	}),
];

export const propertyTypeValidator = [
	...stringQueryBodyValidator({
		msg: 'Missing or Invalid value for property type',
		queryString: false,
		targetField: 'name',
		optional: false,
	}),
];

export const propertyTypeUpdateValidator = [
	...propertyTypeValidator,
	...propertyTypeUUID,
];

export const propertyTypeQueryValidator = [
	...stringQueryBodyValidator({
		msg: 'Invalid filter for property type field',
		queryString: true,
		targetField: 'name',
		optional: true,
	}),

	...uuidValidator({
		msg: 'Invalid property type id provided',
		queryString: true,
		optional: true,
		targetField: 'id',
	}),

	...limitPageValidator,
];
