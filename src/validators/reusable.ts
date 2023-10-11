import { body, param, query } from 'express-validator';
import * as uuidValidate from 'uuid-validate';

import { OptionalValidatorType, dataOrderingEnum } from '../types';

export const booleanQueryBodyValidator = function ({
	//check if query string or body field
	// if queryString = true we assume it's meant to validate a query string otherwise query body
	queryString = false,
	// check if the field is optional or not
	optional = false,
	// targetField to check for the conditions
	targetField,
	// custom message for the error response
	msg = null,
}: OptionalValidatorType) {
	const payload = (
		queryString
			? query(
					targetField,
					msg ?? msg ?? `Missing or Invalid value for ${targetField}`
			  )
			: body(targetField, msg ?? `Missing or Invalid value for ${targetField}`)
	)
		.escape()
		.trim()
		.isBoolean()
		.toBoolean()
		.notEmpty();

	if (optional) payload.optional();

	return [payload.exists({ checkFalsy: false, checkNull: true })];
};

export const stringQueryBodyValidator = function ({
	//check if query string or body field
	// if queryString = true we assume it's meant to validate a query string otherwise query body
	queryString = false,
	// check if the field is optional or not
	optional = false,
	// targetField to check for the conditions
	targetField,
	// custom message for the error response
	msg = null,
}: OptionalValidatorType) {
	const payload = (
		queryString
			? query(
					targetField,
					msg ?? msg ?? `Missing or Invalid value for ${targetField}`
			  )
			: body(targetField, msg ?? `Missing or Invalid value for ${targetField}`)
	)
		.isString()
		.escape()
		.trim();

	if (optional) payload.optional();

	return [payload.exists({ checkFalsy: true, checkNull: true })];
};

export const stringArrayQueryBodyValidator = function ({
	//check if query string or body field
	// if queryString = true we assume it's meant to validate a query string otherwise query body
	queryString = false,
	// check if the field is optional or not
	optional = false,
	// targetField to check for the conditions
	targetField,
	// custom message for the error response
	msg = null,
}: OptionalValidatorType) {
	const payload = (
		queryString
			? query(
					targetField,
					msg ?? msg ?? `Missing or Invalid value for ${targetField}`
			  )
			: body(targetField, msg ?? `Missing or Invalid value for ${targetField}`)
	)
		.isArray()
		.toArray()
		.withMessage(msg)
		.custom((value: string[], meta) => {
			value.map((singleValue) => {
				if (typeof singleValue !== 'string')
					throw msg ?? `Invalid string provided for field ${targetField}`;
			});
			return true;
		});

	if (optional) payload.optional();

	return [payload.exists({ checkFalsy: true, checkNull: true })];
};

export const numericQueryBodyParamValidator = function ({
	// check if this field is in body
	specialParamInBody = false,

	//check if query string or body field
	// if queryString = true we assume it's meant to validate a query string otherwise query body
	queryString = false,
	// check if the field is optional or not
	optional = false,
	// targetField to check for the conditions
	targetField,
	// custom message for the error response
	msg = null,
}: OptionalValidatorType) {
	const payload = (
		specialParamInBody
			? body(targetField, msg ?? `Missing or Invalid value for ${targetField}`)
			: queryString
			? query(
					targetField,
					msg ?? msg ?? `Missing or Invalid value for ${targetField}`
			  )
			: param(targetField, msg ?? `Missing or Invalid value for ${targetField}`)
	)
		.escape()
		.trim()
		.toInt()
		.isNumeric();

	if (optional) payload.optional();

	return [payload.exists({ checkFalsy: true, checkNull: true })];
};

export const floatQueryBodyValidator = function ({
	//check if query string or body field
	// if queryString = true we assume it's meant to validate a query string otherwise query body
	queryString = false,
	// check if the field is optional or not
	optional = false,
	// targetField to check for the conditions
	targetField,
	// custom message for the error response
	msg = null,
}: OptionalValidatorType) {
	const payload = (
		queryString
			? query(
					targetField,
					msg ?? msg ?? `Missing or Invalid value for ${targetField}`
			  )
			: body(targetField, msg ?? `Missing or Invalid value for ${targetField}`)
	)
		.escape()
		.trim()
		.isNumeric()
		.toFloat();

	if (optional) payload.optional();

	return [payload.exists({ checkFalsy: true, checkNull: true })];
};

export const uuidValidator = function ({
	//check if in query string or params field
	// if queryString = true we assume it's meant to validate a query string otherwise query param
	queryString = false,
	// check if the field is optional or not
	optional = false,
	// targetField to check for the conditions
	targetField,
	// custom message for the error response
	msg = null,
	// if the uuid is in body section
	specialParamInBody = false,
}: Pick<OptionalValidatorType, 'optional' | 'queryString' | 'targetField'> &
	Partial<OptionalValidatorType>) {
	const payload = (
		specialParamInBody
			? body(
					targetField ?? 'id',
					msg ?? 'Missing or Invalid value for id field'
			  )
			: queryString
			? query(
					targetField ?? 'id',
					msg ?? 'Missing or Invalid value for id field'
			  )
			: param(
					targetField ?? 'id',
					msg ?? 'Missing or Invalid value for id field'
			  )
	)
		.escape()
		.trim()
		.notEmpty()
		.isUUID('4')
		.withMessage('Invalid uuid provided for filter id field');

	if (optional) payload.optional();

	return [payload.exists({ checkFalsy: true, checkNull: true })];
};

export const uuidArrayValidator = function ({
	//check if in query string or params field
	// check if the field is optional or not
	optional = false,
	// targetField to check for the conditions
	targetField = 'id',
	// custom message for the error response
	msg = null,
	// if the uuid is in body section
	specialParamInBody = false,
}: Pick<OptionalValidatorType, 'optional' | 'targetField'> &
	Partial<OptionalValidatorType>) {
	const payload = (
		specialParamInBody
			? body(
					targetField ?? 'id',
					msg ?? `Missing or Invalid value for ${targetField} field`
			  )
			: query(
					targetField ?? 'id',
					msg ?? `Missing or Invalid value for ${targetField} field`
			  )
	)
		.isArray()
		.withMessage(`${targetField} field must be an array of ${targetField}s`)
		.custom((value: string[], meta) =>
			value.map((item) => {
				if (!uuidValidate(item))
					throw `Invalid uuid value provided ${item} for ${targetField} field`;
				return true;
			})
		);

	if (optional) payload.optional();

	return [payload.exists({ checkFalsy: true, checkNull: true })];
};

export const limitPageValidator = [
	...numericQueryBodyParamValidator({
		msg: 'Missing or Invalid query param for page field provided',
		queryString: true,
		targetField: 'page',
		optional: true,
	}),

	...numericQueryBodyParamValidator({
		msg: 'Missing or Invalid query param for limit field provided',
		queryString: true,
		targetField: 'limit',
		optional: true,
	}),
];

export const querySortValidator = [
	query('sort', 'Invalid filter for sort')
		.escape()
		.trim()
		.isString()
		.optional()
		.custom((value: string, meta) =>
			value.toUpperCase() === dataOrderingEnum.Descending ||
			value.toUpperCase() === dataOrderingEnum.Ascending
				? true
				: false
		)
		.customSanitizer((value: string, meta) => value.toUpperCase())
		.exists({ checkFalsy: true, checkNull: true }),
];

export const propertyTypeQueryValidator = [
	// validate type uuids passed as query params
	...uuidArrayValidator({
		msg: 'Invalid filter for property type field',
		queryString: true,
		targetField: 'type',
		optional: true,
	}),
];

export const propertyHouseQueryValidator = [
	query('year_build', 'Invalid filter for year built')
		.isObject()
		.optional()
		.exists({ checkFalsy: true, checkNull: true }),

	...numericQueryBodyParamValidator({
		msg: 'Invalid filter for minimum year_built',
		targetField: 'year_built.min',
		queryString: true,
		optional: true,
	}),

	...numericQueryBodyParamValidator({
		msg: 'Invalid filter for maximum year_built',
		targetField: 'year_built.max',
		queryString: true,
		optional: true,
	}),

	...stringQueryBodyValidator({
		msg: 'Invalid filter for name',
		queryString: true,
		targetField: 'name',
		optional: true,
	}),

	...stringQueryBodyValidator({
		msg: 'Invalid filter for address',
		targetField: 'address',
		queryString: true,
		optional: true,
	}),

	query('land_size', 'Invalid filter for land_size')
		.isObject()
		.optional()
		.exists({ checkFalsy: true, checkNull: true }),

	...floatQueryBodyValidator({
		msg: 'Invalid filter for maximum land_size',
		targetField: 'land_size.max',
		queryString: true,
		optional: true,
	}),

	...floatQueryBodyValidator({
		msg: 'Invalid filter for maximum land_size',
		targetField: 'land_size.min',
		queryString: true,
		optional: true,
	}),

	query('currLocation', 'Invalid filter for currLocation')
		.isObject()
		.optional()
		.exists({ checkFalsy: true, checkNull: true }),

	...floatQueryBodyValidator({
		msg: 'Invalid filter for lattitude in currLocation field',
		targetField: 'currLocation.lat',
		queryString: true,
		optional: true,
	}),

	...floatQueryBodyValidator({
		msg: 'Invalid filter for longitude in currLocation field',
		targetField: 'currLocation.long',
		queryString: true,
		optional: true,
	}),

	...numericQueryBodyParamValidator({
		msg: 'Invalid filter for radius',
		targetField: 'radius',
		queryString: true,
		optional: true,
	}),

	//uuid features array
	...uuidArrayValidator({
		msg: 'Invalid filter for features',
		targetField: 'features',
		queryString: true,
		optional: true,
	}),

	...stringQueryBodyValidator({
		msg: 'Invalid filter for nearest_town',
		targetField: 'nearest_town',
		queryString: true,
		optional: true,
	}),

	...propertyTypeQueryValidator,
];

export const featuresValidator = [
	...uuidArrayValidator({
		msg: "'Invalid data provided for features field'",
		specialParamInBody: true,
		targetField: 'features',
		optional: false,
	}),
];

export const photosValidator = [
	...stringArrayQueryBodyValidator({
		msg: 'Invalid value provided for photos array',
		queryString: false,
		targetField: 'photos',
		optional: false,
	}),
];
