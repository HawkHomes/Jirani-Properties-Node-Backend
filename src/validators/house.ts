import { additionInfoBodyValidator } from './global';
import {
	stringArrayQueryBodyValidator,
	propertyHouseQueryValidator,
	numericQueryBodyParamValidator,
	floatQueryBodyValidator,
	querySortValidator,
	limitPageValidator,
	uuidArrayValidator,
	uuidValidator,
	assetStatusQueryBodyValidator,
	photosValidator,
} from './reusable';

export const houseUUIDValidator = [
	...uuidValidator({
		msg: 'Invalid uuid value for url or query param house',
		queryString: false,
		targetField: 'hid',
		optional: false,
	}),
];

export const HouseValidator = [
	...numericQueryBodyParamValidator({
		msg: 'total_available field is required',
		targetField: 'total_available',
		specialParamInBody: true,
		queryString: false,
		optional: false,
	}),

	// validate the additional infor
	...additionInfoBodyValidator({ optional: true, queryString: false }),

	// check the category validator
	...uuidValidator({
		msg: 'Invalid uuid field for field category',
		specialParamInBody: true,
		targetField: 'category',
		queryString: false,
		optional: false,
	}),

	...uuidArrayValidator({
		msg: "'Invalid data provided for features field'",
		specialParamInBody: true,
		targetField: 'features',
		optional: false,
	}),

	...assetStatusQueryBodyValidator({
		msg: 'Missing or invalid value provided for the status field',
		targetField: 'status',
		queryString: false,
		optional: false,
	}),

	...floatQueryBodyValidator({
		msg: 'The cost field is required',
		queryString: false,
		targetField: 'cost',
		minValue: 3500,
		optional: false,
	}),

	...photosValidator,
];

export const houseUpdateValidator = [
	...uuidValidator({
		msg: 'Invalid uuid value for house id',
		queryString: false,
		optional: false,
		targetField: 'hid',
	}),

	...numericQueryBodyParamValidator({
		msg: 'total_available field is required',
		targetField: 'total_available',
		queryString: false,
		optional: true,
	}),

	// validate the additional infor
	...additionInfoBodyValidator({ optional: true, queryString: false }),

	// check the category validator
	...uuidValidator({
		msg: 'Invalid uuid field for field category',
		specialParamInBody: true,
		targetField: 'category',
		queryString: false,
		optional: true,
	}),

	...uuidArrayValidator({
		msg: "'Invalid data provided for features field'",
		specialParamInBody: true,
		targetField: 'features',
		optional: true,
	}),

	...assetStatusQueryBodyValidator({
		msg: 'Invalid value provided for the status field',
		targetField: 'status',
		queryString: false,
		optional: true,
	}),

	...stringArrayQueryBodyValidator({
		msg: 'Invalid value provided for photos array',
		queryString: false,
		targetField: 'photos',
		optional: true,
	}),

	...floatQueryBodyValidator({
		msg: 'Cost field is required',
		queryString: false,
		targetField: 'cost',
		minValue: 3500,
		optional: true,
	}),
];

export const houseQueryValidator = [
	...propertyHouseQueryValidator,
	...uuidArrayValidator({
		targetField: 'category',
		queryString: true,
		optional: true,
	}),
	...querySortValidator,
	...limitPageValidator,
	...uuidValidator({
		queryString: true,
		targetField: 'id',
		optional: true,
	}),

	...numericQueryBodyParamValidator({
		msg: 'Invalid value for no of available houses',
		targetField: 'total_available',
		queryString: true,
		optional: true,
	}),

	...numericQueryBodyParamValidator({
		msg: 'Invalid value for minimum cost field',
		targetField: 'cost.min',
		queryString: true,
		minValue: 1000,
		optional: true,
	}),

	...numericQueryBodyParamValidator({
		msg: 'Invalid value for maximum cost field',
		targetField: 'cost.max',
		queryString: true,
		minValue: 1000,
		optional: true,
	}),
];
