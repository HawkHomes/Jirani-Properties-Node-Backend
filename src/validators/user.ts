import { body, query } from 'express-validator';

import { phoneNumberBodyValidator } from './global';
import { OptionalValidatorType } from '../types';
import {
	booleanQueryBodyValidator,
	numericQueryBodyParamValidator,
	stringQueryBodyValidator,
	uuidValidator,
} from './reusable';

export const userUUIDValidator = [
	...uuidValidator({
		msg: 'Invalid uuid param provided',
		queryString: false,
		targetField: 'uid',
		optional: false,
	}),
];

export const userOTPValidator = [
	...numericQueryBodyParamValidator({
		msg: 'Invalid otp param provided',
		queryString: false,
		targetField: 'otp',
		optional: false,
	}),
];

export const emailBodyValidator = function ({
	queryString = false,
	optional = false,
}: Pick<OptionalValidatorType, 'optional' | 'queryString'>) {
	const payload = (
		queryString
			? query('email_addr', 'Email address is missing')
			: body('email_addr', 'Email address is missing')
	)
		.escape()
		.trim()
		.isEmail()
		.withMessage('Invalid email provided')
		.normalizeEmail();

	if (optional) payload.optional();

	return [payload.exists({ checkFalsy: true, checkNull: true })];
};

export const passwordBodyValidator = function ({
	signInChain = false,
	optional = false,
}: Pick<OptionalValidatorType, 'optional' | 'signInChain'>) {
	const payload = body('password', 'Password field is missing or invalid')
		.escape()
		.trim();

	if (!signInChain)
		payload
			.isLength({ max: 16, min: 8 })
			.withMessage('Password does not meet the minimum password requirements');

	if (optional) payload.optional();

	return [payload.exists({ checkFalsy: true, checkNull: true })];
};

export const kraPinBodyValidator = function ({
	optional = false,
}: Pick<OptionalValidatorType, 'optional'>) {
	const payload = body('kra_pin', 'Kra Pin field is missing')
		.if(body('is_landlord').equals('true'))
		.escape()
		.trim()
		.notEmpty();

	if (optional) payload.optional();

	return [payload.exists({ checkFalsy: true, checkNull: true })];
};

export const idNoBodyValidator = function ({
	queryString = false,
	optional = false,
}: Pick<OptionalValidatorType, 'optional' | 'queryString'>) {
	const payload = (
		queryString
			? query('id_no', 'Missing or invalid Id number')
			: body('id_no', 'Missing or invalid Id number')
	)
		.if(body('is_landlord').equals('true'))
		.escape()
		.trim()
		.notEmpty();

	if (optional) payload.optional();

	return [payload.exists({ checkFalsy: true, checkNull: true })];
};

export const userSignInValidator = [
	...phoneNumberBodyValidator({
		queryString: false,
		signInChain: true,
		optional: false,
	}),
	...emailBodyValidator({ optional: false, queryString: false }),
	...passwordBodyValidator({ optional: false, signInChain: true }),
];

export const userSignUpValidator = [
	body('first_name', 'First name field is missing')
		// .if(body('is_landlord').equals('true'))
		.notEmpty()
		.escape()
		.trim()
		.exists({ checkFalsy: true, checkNull: true }),

	body('last_name', 'Last name field is missing')
		// .if(body('is_landlord').equals('true'))
		.notEmpty()
		.escape()
		.trim()
		.exists({ checkFalsy: true, checkNull: true }),

	...booleanQueryBodyValidator({
		msg: 'is_landlord field is required',
		targetField: 'is_landlord',
		queryString: false,
		optional: false,
	}),

	...idNoBodyValidator({
		queryString: false,
		optional: false,
	}),
	...kraPinBodyValidator({ optional: false }),

	...phoneNumberBodyValidator({
		queryString: false,
		signInChain: false,
		optional: false,
	}),
	...emailBodyValidator({ optional: false, queryString: false }),
	...passwordBodyValidator({ optional: false }),
];

export const updateUserValidator = [
	...phoneNumberBodyValidator({ optional: true, queryString: false }),
	...emailBodyValidator({ optional: true, queryString: false }),
	...passwordBodyValidator({ optional: true }),
	...stringQueryBodyValidator({
		msg: 'id field is missing or invalid',
		targetField: 'id_no',
		queryString: false,
		optional: true,
	}),
	...kraPinBodyValidator({ optional: true }),
];

export const forgotPasswordValidator = [
	...emailBodyValidator({ optional: false, queryString: false }),
	// ...phoneNumberBodyValidator({
	// 	queryString: false,
	// 	signInChain: false,
	// 	optional: false,
	// }),
];

export const forgotPasswordHandlerValidator = [
	...passwordBodyValidator({ optional: false, signInChain: true }),
	...stringQueryBodyValidator({
		msg: 'Missing or invalid token provided',
		targetField: 'token',
		queryString: false,
		optional: false,
	}),
];
