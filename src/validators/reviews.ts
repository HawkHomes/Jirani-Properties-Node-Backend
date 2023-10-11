import {
	floatQueryBodyValidator,
	stringQueryBodyValidator,
	uuidValidator,
} from './reusable';

export const reviewUUIDValidator = [
	...uuidValidator({
		msg: 'Missing or Invalid review id provided',
		queryString: false,
		optional: false,
		targetField: 'id',
	}),
];

export const reviewValidator = [
	...reviewUUIDValidator,
	...stringQueryBodyValidator({
		msg: 'Missing or invalid review cannot be blank',
		targetField: 'review',
		queryString: false,
		optional: false,
	}),

	...floatQueryBodyValidator({
		msg: 'Invalid value for rating',
		targetField: 'rating',
		queryString: false,
		optional: true,
	}),
];
