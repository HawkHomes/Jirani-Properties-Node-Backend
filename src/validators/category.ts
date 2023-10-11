import {
	limitPageValidator,
	stringQueryBodyValidator,
	uuidValidator,
} from './reusable';

export const categoryUUIDParamValidator = uuidValidator({
	msg: 'Invalid url parameter for category id provided',
	queryString: false,
	targetField: 'id',
	optional: false,
});

export const categoryValidator = [
	...stringQueryBodyValidator({
		msg: 'Missing or Invalid value for category',
		queryString: false,
		targetField: 'name',
		optional: false,
	}),
];

export const categoryUpdateValidator = [
	// check the url param id
	...categoryUUIDParamValidator,
	...categoryValidator,
];

export const categoryQueryValidator = [
	...uuidValidator({
		msg: 'Invalid query parameter for category id provided',
		queryString: true,
		targetField: 'id',
		optional: true,
	}),

	...stringQueryBodyValidator({
		msg: 'Missing or Invalid query param for category field provided',
		queryString: true,
		targetField: 'name',
		optional: true,
	}),

	...limitPageValidator,
];
