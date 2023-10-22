import { body, param, query } from 'express-validator';
import * as uuidValidate from 'uuid-validate';

import { OptionalValidatorType, assetStatus, dataOrderingEnum } from '../types';

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

export const assetStatusQueryBodyValidator = function ({
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
		.isString()
		.customSanitizer((value: string, meta) => {
			if (!value) throw `Invalid value for ${targetField}`;

			return `${value.at(0).toUpperCase()}${value.substring(1).toLowerCase()}`;
		})
		.custom((value, meta) => Object.values(assetStatus).includes(value))
		.withMessage(`Invalid value provided for ${targetField}`);

	if (optional) payload.optional();

	return [
		payload
			.exists({ checkFalsy: true, checkNull: true })
			.withMessage('The status field missing and is required.'),
	];
};

export const photosCustomValidator = function ({
	// targetField to check for the conditions
	targetField,
	// custom message for the error response
	msg = null,
	minValue = null,
	maxValue = null,
	optional = false,
}: Pick<
	OptionalValidatorType,
	'maxValue' | 'minValue' | 'targetField' | 'msg' | 'optional'
>) {
	const payload = body(
		targetField,
		msg ?? `Missing or Invalid value for ${targetField}`
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
		})
		.customSanitizer((input: string[], meta) =>
			input.map((currItem) => currItem.split('?').at(0).split('/').at(-1))
		);

	if (maxValue)
		payload
			.custom((currItem: string[], meta) => currItem.length <= maxValue)
			.withMessage(
				`The ${targetField} exceeds the maximum number of ${targetField} required`
			);

	if (minValue)
		payload
			.custom((currItem: string[], meta) => currItem.length >= minValue - 1)
			.withMessage(
				`The ${targetField} field must contain atleast ${minValue} items`
			);

	if (optional) payload.optional();

	return [payload.exists({ checkFalsy: true, checkNull: true })];
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
		.trim()
		.escape()
		.isString();

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
	minValue = null,
	maxValue = null,
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

	if (maxValue)
		payload
			.custom((currItem: string[], meta) => currItem.length <= maxValue)
			.withMessage(
				`The ${targetField} exceeds the maximum number of ${targetField} required`
			);

	if (minValue)
		payload
			.custom((currItem: string[], meta) => currItem.length >= minValue - 1)
			.withMessage(
				`The ${targetField} field must contain atleast ${minValue} items`
			);

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
	// minimum value to use
	minValue = null,
	// max value to use
	maxValue = null,
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
		.custom((value, meta) => value >= 0)
		.isNumeric();

	if (maxValue)
		payload
			.custom((value, meta) => value <= maxValue)
			.withMessage(
				`The value for ${targetField} exceeds the maximum value required`
			);

	if (minValue)
		payload
			.custom((value, meta) => value >= minValue)
			.withMessage(
				`The value for ${targetField} is below the minimum value required`
			);

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

	// the field the target field depends on
	dependsOnField = null,

	//minimum value
	minValue = null,
}: OptionalValidatorType) {
	const payload = (
		queryString
			? query(
					targetField,
					msg ?? msg ?? `Missing or Invalid value for ${targetField}`
			  )
			: body(targetField, msg ?? `Missing or Invalid value for ${targetField}`)
	)
		.if(
			queryString
				? query(dependsOnField).exists({ checkFalsy: true, checkNull: true })
				: body(dependsOnField).exists({ checkFalsy: true, checkNull: true })
		)

		.escape()
		.trim()
		.isNumeric()
		.toFloat();

	if (minValue)
		payload
			.custom((value, meta) => value > minValue)
			.withMessage(
				`The ${targetField} cannot be less then the minimum ${targetField}(${minValue})`
			);
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

	...assetStatusQueryBodyValidator({
		msg: 'Invalid value provided for the status filter param field',
		targetField: 'status',
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
	...photosCustomValidator({
		msg: 'Invalid value provided for photos array',
		targetField: 'photos',
		optional: false,
		maxValue: 15,
		minValue: 3,
	}),
];

export const photosOptionalValidator = [
	...photosCustomValidator({
		msg: 'Invalid value provided for photos array',
		targetField: 'photos',
		optional: false,
		maxValue: 15,
		minValue: 3,
	}),
];

export const coordinatesQueryBodyValidator = function ({
	//check if in query string or params field
	queryString = false,

	// check if the field is optional or not
	optional = false,
	// targetField to check for the conditions
	targetField = 'coordinates',
	// custom message for the error response
	msg = null,
}: Pick<OptionalValidatorType, 'optional' | 'targetField'> &
	Partial<Pick<OptionalValidatorType, 'msg' | 'queryString'>>) {
	const basePayload = queryString
		? query(targetField, `Apartment Location/${targetField} is missing`)
		: body(targetField, `Apartment Location/${targetField} is missing`);

	if (optional) basePayload.optional();

	const payload = [
		...floatQueryBodyValidator({
			msg: 'Invalid value for latitude field',
			targetField: `${targetField}.lat`,
			queryString,
			optional,
		}),

		...floatQueryBodyValidator({
			msg: 'Invalid value for longitude field',
			targetField: 'coordinates.long',
			queryString,
			optional,
		}),
	];

	return [
		basePayload.isObject().exists({ checkFalsy: true, checkNull: true }),
		...payload,
	];
};
