import { responseInterface } from '../types';

export const TYPE_INTERNAL_ERROR: responseInterface = {
	details: 'Something went wrong',
	type: 'Internal Server Error',
	title: 'Request Failed',
	status: 500,
};

export const TYPE_NOT_FOUND: responseInterface = {
	details: 'Requested resource was not found.',
	title: 'Request Failed',
	type: 'Not Found',
	status: 404,
};
export const TYPE_UNAUTHORIZED: responseInterface = {
	details: 'You are not authorized to access this resource.',
	title: 'Request Failed',
	type: 'Unauthorized',
	status: 401,
};

export const TYPE_NO_CONTENT: responseInterface = {
	details: 'The Item was Updated',
	title: 'Request Succeeded',
	type: 'No Content',
	status: 204,
};
export const TYPE_ITEM_CREATED: responseInterface = {
	details: 'The resource was created successfully.',
	title: 'Request Succeeded',
	type: 'Created',
	status: 201,
};
export const TYPE_NOT_MODIFIED: responseInterface = {
	details: 'The content you are looking for has not been modified',
	title: 'Resource not modified',
	type: 'Not Modified',
	status: 304,
};
export const TYPE_BAD_REQUEST: responseInterface = {
	details: 'Malformed or invalid parameters provided',
	title: 'Malformed or invalid data provided',
	type: 'Bad Request',
	status: 400,
};
export const TYPE_FORBIDDEN: responseInterface = {
	title: "You don't have permission to access this resource",
	type: 'Permission Denied',
	status: 403,
};

export const TYPE_OK: responseInterface = {
	details: 'Request was successfull',
	title: 'Request succeded',
	status: 200,
	type: 'OK',
};

export const fieldsWithPossibleUUId: Array<string> = [
	'category',
	'features',
	'agency',
	'owner',
	'type',
];

//others
export const API_PROPERTYTYPE_ENDPOINT = '/propertytypes';
export const API_PROPERTIES_ENDPOINT = '/properties';
export const API_CATEGORIES_ENDPOINT = '/categories';
export const API_FEATURES_ENDPOINT = '/features';
export const API_AGENCY_ENDPOINT = '/agencies';
export const API_HOUSES_ENDPOINT = '/houses';
export const API_USER_ENDPOINT = '/users';
export const API_PREFIX = '/api';
