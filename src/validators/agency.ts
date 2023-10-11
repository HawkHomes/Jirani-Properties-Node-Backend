import {
	limitPageValidator,
	stringQueryBodyValidator,
	uuidValidator,
} from './reusable';
import { addressBodyValidator, phoneNumberBodyValidator } from './global';

export const agencyValidator = [
	...stringQueryBodyValidator({
		queryString: false,
		targetField: 'name',
		optional: false,
	}),

	...phoneNumberBodyValidator({
		queryString: false,
		optional: false,
	}),

	...addressBodyValidator({
		queryString: false,
		optional: false,
	}),
];

export const agencyUpdateValidator = [
	...stringQueryBodyValidator({
		queryString: false,
		targetField: 'name',
		optional: true,
	}),

	...phoneNumberBodyValidator({
		queryString: false,
		optional: true,
	}),

	...addressBodyValidator({
		queryString: false,
		optional: true,
	}),
];

export const AgencyQueryValidator = [
	...uuidValidator({
		msg: 'Invalid uuid provided for agency filter id',
		queryString: true,
		targetField: 'id',
		optional: true,
	}),

	...phoneNumberBodyValidator({
		msg: 'Invalid filter for phone number',
		queryString: true,
		optional: true,
	}),

	...stringQueryBodyValidator({
		msg: 'Invalid filter for name',
		queryString: true,
		targetField: 'name',
		optional: true,
	}),

	...limitPageValidator,
];
