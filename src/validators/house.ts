import { additionInfoBodyValidator } from './global';
import {
	stringArrayQueryBodyValidator,
	propertyHouseQueryValidator,
	numericQueryBodyParamValidator,
	booleanQueryBodyValidator,
	floatQueryBodyValidator,
	querySortValidator,
	limitPageValidator,
	uuidArrayValidator,
	uuidValidator,
} from './reusable';

export const houseUUIDValidator = [
	...uuidValidator({
		msg: 'Invalid uuid value for query param house',
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

	...booleanQueryBodyValidator({
		msg: 'The for_sale field must be a boolean',
		targetField: 'for_sale',
		queryString: false,
		optional: false,
	}),

	...stringArrayQueryBodyValidator({
		msg: 'Invalid value provided for photos array',
		targetField: 'photos',
		queryString: false,
		optional: false,
	}),

	...floatQueryBodyValidator({
		msg: 'Cost field is required',
		queryString: false,
		targetField: 'cost',
		optional: false,
	}),
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

	...booleanQueryBodyValidator({
		msg: 'The for_sale field must be a boolean',
		targetField: 'for_sale',
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

	...booleanQueryBodyValidator({
		msg: 'Invalid filter for for_sale, the value must be a boolean',
		targetField: 'for_sale',
		queryString: true,
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
		optional: true,
	}),

	...numericQueryBodyParamValidator({
		msg: 'Invalid value for maximum cost field',
		targetField: 'cost.max',
		queryString: true,
		optional: true,
	}),
];
