import {
	numericQueryBodyParamValidator,
	stringArrayQueryBodyValidator,
} from './reusable';

export const signatureCountValidator = [
	...numericQueryBodyParamValidator({
		msg: 'Missing or invalid value for for no_img field',
		targetField: 'no_img',
		queryString: true,
		optional: false,
		maxValue: 15,
	}),
];

export const imgIdArrayValidator = [
	...stringArrayQueryBodyValidator({
		msg: 'Missing or invalid value for for items field',
		targetField: 'items',
		queryString: false,
		optional: false,
		maxValue: 15,
		minValue: 1,
	}),
];
