import { body } from 'express-validator';

import { additionInfoBodyValidator } from './global';
import {
	numericQueryBodyParamValidator,
	coordinatesQueryBodyValidator,
	assetStatusQueryBodyValidator,
	propertyHouseQueryValidator,
	stringQueryBodyValidator,
	floatQueryBodyValidator,
	querySortValidator,
	uuidArrayValidator,
	featuresValidator,
	limitPageValidator,
	photosValidator,
	uuidValidator,
	photosOptionalValidator,
} from './reusable';

export const propertyUUidValidator = [
	...uuidValidator({
		msg: 'Invalid uuid value for property id',
		specialParamInBody: false,
		queryString: false,
		optional: false,
		targetField: 'pid',
	}),
];

export const propertyValidator = [
	...stringQueryBodyValidator({
		msg: 'Apartment name is missing',
		queryString: false,
		targetField: 'name',
		optional: false,
	}),

	...coordinatesQueryBodyValidator({
		msg: 'Apartment Location/coordinates is missing',
		targetField: 'coordinates',
		queryString: false,
		optional: false,
	}),

	...stringQueryBodyValidator({
		msg: 'Nearest town is missing',
		targetField: 'nearest_town',
		queryString: false,
		optional: false,
	}),

	...uuidValidator({
		msg: 'Agency is missing or invalid',
		specialParamInBody: true,
		targetField: 'agency',
		queryString: false,
		optional: true,
	}),

	...numericQueryBodyParamValidator({
		msg: 'Missing or Invalid value for land size provided',
		specialParamInBody: true,
		targetField: 'land_size',
		queryString: false,
		optional: false,
	}),

	...numericQueryBodyParamValidator({
		msg: 'Missing  or invalid value for year built provided',
		specialParamInBody: true,
		targetField: 'year_built',
		queryString: false,
		optional: false,
	}),

	...assetStatusQueryBodyValidator({
		msg: 'Missing or invalid value provided for the status field',
		targetField: 'status',
		queryString: false,
		optional: false,
	}),

	...stringQueryBodyValidator({
		targetField: 'address',
		queryString: false,
		optional: false,
	}),

	// validate the additional infor
	...additionInfoBodyValidator({
		msg: 'Missing or Invalid value provided for additional_info field',
		queryString: false,
		maxValue: 250,
		optional: false,
		minValue: 10,
	}),

	...uuidValidator({
		msg: 'Missing or invalid Information for property type',
		specialParamInBody: true,
		queryString: false,
		targetField: 'type',
		optional: false,
	}),

	...featuresValidator,
	...photosValidator,
];

export const propertyUpdateValidator = [
	...propertyUUidValidator,

	...stringQueryBodyValidator({
		msg: 'Apartment name is missing is missing or invalid',
		queryString: false,
		targetField: 'name',
		optional: true,
	}),

	...stringQueryBodyValidator({
		targetField: 'address',
		queryString: false,
		optional: true,
	}),

	...assetStatusQueryBodyValidator({
		msg: 'Invalid value provided for the status field',
		targetField: 'status',
		queryString: false,
		optional: true,
	}),

	body('coordinates', 'Apartment Location/coordinates is missing')
		.isObject()
		.optional()
		.exists({ checkFalsy: true, checkNull: true }),

	...floatQueryBodyValidator({
		msg: 'Invalid value for latitude field',
		targetField: 'coordinates.lat',
		queryString: false,
		optional: true,
	}),

	...floatQueryBodyValidator({
		msg: 'Invalid value for longitude field',
		targetField: 'coordinates.long',
		queryString: false,
		optional: true,
	}),

	...stringQueryBodyValidator({
		msg: 'Nearest town is missing',
		targetField: 'nearest_town',
		queryString: false,
		optional: true,
	}),

	...uuidValidator({
		msg: 'Agency is missing or invalid',
		specialParamInBody: true,
		targetField: 'agency',
		queryString: false,
		optional: true,
	}),

	...numericQueryBodyParamValidator({
		msg: 'Missing or Invalid value for land size provided',
		specialParamInBody: true,
		targetField: 'land_size',
		queryString: false,
		optional: true,
	}),

	...numericQueryBodyParamValidator({
		msg: 'Missing  or invalid value for year built provided',
		specialParamInBody: true,
		targetField: 'year_built',
		queryString: false,
		optional: true,
	}),

	// validate the additional infor
	...additionInfoBodyValidator({ optional: true, queryString: false }),

	...uuidValidator({
		msg: 'Missing or invalid Information for property type',
		specialParamInBody: true,
		queryString: false,
		targetField: 'type',
		optional: true,
	}),

	...uuidArrayValidator({
		msg: "'Invalid data provided for features field'",
		specialParamInBody: true,
		targetField: 'features',
		optional: true,
	}),

	...photosOptionalValidator,
];

export const propertyQueryValidator = [
	...propertyHouseQueryValidator,
	...querySortValidator,
	...limitPageValidator,

	...uuidValidator({
		queryString: true,
		targetField: 'id',
		optional: true,
	}),
];
