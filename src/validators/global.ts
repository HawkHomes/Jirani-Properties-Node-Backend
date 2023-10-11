import { body, query } from 'express-validator';
import { OptionalValidatorType } from '../types';

export const phoneNumberBodyValidator = function ({
	queryString = false,
	signInChain = false,
	optional = false,
	msg,
}: Pick<
	OptionalValidatorType,
	'optional' | 'queryString' | 'signInChain' | 'msg'
>) {
	const payload = queryString
		? query('phone', msg ?? 'Invalid value provided for phone number field')
		: body('phone', msg ?? 'Invalid value provided for phone number field'); //continue if the email field is empty

	// if the validation is in the signin area
	if (signInChain) payload.if(body('email_addr').isEmpty());

	payload
		.escape()
		.trim()
		.isLength({ min: 9, max: 12 })
		.withMessage('Invalid phone number given')
		.customSanitizer((value: string) => value.replace(/^\+/, ''))
		.customSanitizer((value: string) => value.replace(/^0/, '254'))
		.customSanitizer((value: string) =>
			value.length == 9 ? `254${value}` : value
		);

	if (optional) payload.optional();

	return [payload.exists({ checkFalsy: true, checkNull: true })];
};

export const addressBodyValidator = function ({
	queryString = false,
	optional = false,
	msg,
}: Pick<OptionalValidatorType, 'optional' | 'queryString'> &
	Partial<OptionalValidatorType>) {
	const payload = (
		queryString
			? query('address', msg ?? 'Apartment address is missing')
			: body('address', msg ?? 'Apartment address is missing')
	)
		.escape()
		.trim()
		.isString();

	if (optional) payload.optional();

	return [payload.exists({ checkFalsy: true, checkNull: true })];
};

export const additionInfoBodyValidator = function ({
	queryString = false,
	optional = false,
	msg,
}: Pick<OptionalValidatorType, 'optional' | 'queryString'> &
	Partial<OptionalValidatorType>) {
	const payload = (
		queryString
			? query('additional_info', msg ?? 'This field cannot be empty')
			: body('additional_info', msg ?? 'This field cannot be empty')
	)
		.escape()
		.trim()
		.optional()
		.isString();

	if (optional) payload.optional();

	return [payload.exists({ checkFalsy: true, checkNull: true })];
};
