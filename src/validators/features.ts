import {
	limitPageValidator,
	stringQueryBodyValidator,
	uuidValidator,
} from './reusable';

export const featureUUidParamValidate = uuidValidator({
	msg: 'Invalid url parameter for feature id provided',
	queryString: false,
	targetField: 'id',
	optional: false,
});

export const featureValidator = [
	...stringQueryBodyValidator({
		msg: 'Missing or Invalid value for feature name',
		queryString: false,
		targetField: 'name',
		optional: false,
	}),
];

export const featureUpdateValidator = [
	// check the url param id
	...featureUUidParamValidate,
	...featureValidator,
];

export const featureQueryValidator = [
	...uuidValidator({
		msg: 'Invalid query parameter for feature id provided',
		queryString: true,
		targetField: 'id',
		optional: true,
	}),

	...stringQueryBodyValidator({
		msg: 'Missing or Invalid query param for feature field provided',
		queryString: true,
		targetField: 'name',
		optional: true,
	}),

	...limitPageValidator,
];
