import axios from 'axios';

import {
	API_PROPERTYTYPE_ENDPOINT,
	API_PROPERTIES_ENDPOINT,
	API_CATEGORIES_ENDPOINT,
	API_FEATURES_ENDPOINT,
	API_AGENCY_ENDPOINT,
	API_HOUSES_ENDPOINT,
	API_USER_ENDPOINT,
	API_PREFIX,
} from '../utils/constants';
import { CustomError, queryParamEncoder } from '../utils/common';

// export const createUserResolver = (parentValue, args) =>
// 	axios({
// 		url: `http://localhost:4000${API_PREFIX}${API_USER_ENDPOINT}/create`,
// 		method: 'POST',
// 		data: { ...args },
// 	})
// 		.then((payload) => payload.data.data.data)
// 		.catch((err) => err.response.data);

export const getUsersResolver = (parentValue, args, { headers }, ...other) => {
	const queryParams = queryParamEncoder({ params: args });

	return axios({
		url: `http://localhost:4000${API_PREFIX}${API_USER_ENDPOINT}${queryParams}`,
		method: 'GET',
		headers: {
			'Content-Type': headers['content-type'],
			'Authorization': headers.authorization,
			'User-Agent': headers['user-agent'],
			'Accept': headers['accept'],
		},
	})
		.then((payload) => payload.data.data.data)
		.catch((err) => {
			throw new CustomError({ ...err.response.data });
		});
};

export const getUserResolver = (parentValue, args) =>
	axios({
		method: 'GET',
		url: `http://localhost:4000${API_PREFIX}${API_USER_ENDPOINT}?${args.id}`,
	})
		.then((payload) => payload.data.data.data)
		.catch((err) => {
			throw new CustomError({ ...err.response.data });
		});

export const getHousesResolver = (parentValue, args) => {
	const queryParams = queryParamEncoder({ params: args });
	const { pid } = args;

	return axios({
		method: 'GET',
		url: `http://localhost:4000${API_PREFIX}${
			pid ? `${API_PROPERTIES_ENDPOINT}/${pid}` : ''
		}${API_HOUSES_ENDPOINT}${queryParams}`,
	})
		.then((payload) => payload.data.data.data)
		.catch((err) => {
			throw new CustomError({ ...err.response.data });
		});
};

export const getHouseResolver = (parentValue, args) =>
	axios({
		method: 'GET',
		url: `http://localhost:4000${API_PREFIX}${API_HOUSES_ENDPOINT}/${args.id}`,
	})
		.then((payload) => payload.data.data)
		.catch((err) => {
			throw new CustomError({ ...err.response.data });
		});

export const getPropertiesResolver = (parentValue, args) => {
	const queryParams = queryParamEncoder({ params: args });

	return axios({
		method: 'GET',
		url: `http://localhost:4000${API_PREFIX}${API_PROPERTIES_ENDPOINT}${queryParams}`,
	})
		.then((payload) => payload.data.data.data)
		.catch((err) => {
			throw new CustomError({ ...err.response.data });
		});
};

export const getPropertyResolver = (parentValue, args) =>
	axios({
		method: 'GET',
		url: `http://localhost:4000${API_PREFIX}${API_PROPERTIES_ENDPOINT}/${args.id}`,
	})
		.then((payload) => payload.data.data)
		.catch((err) => {
			throw new CustomError({ ...err.response.data });
		});

export const getCategoriesResolver = (parentValue, args) => {
	const queryParams = queryParamEncoder({ params: args });

	return axios({
		method: 'GET',
		url: `http://localhost:4000${API_PREFIX}${API_CATEGORIES_ENDPOINT}${queryParams}`,
	})
		.then((payload) => payload.data.data.data)
		.catch((err) => {
			throw new CustomError({ ...err.response.data });
		});
};

export const getCategoryResolver = (parentValue, args) =>
	axios({
		method: 'GET',
		url: `http://localhost:4000${API_PREFIX}${API_CATEGORIES_ENDPOINT}/${args.id}`,
	})
		.then((payload) => payload.data.data.data)
		.catch((err) => {
			throw new CustomError({ ...err.response.data });
		});

export const getFeaturesResolver = (parentValue, args) => {
	const queryParams = queryParamEncoder({ params: args });

	return axios({
		method: 'GET',
		url: `http://localhost:4000${API_PREFIX}${API_FEATURES_ENDPOINT}${queryParams}`,
	})
		.then((payload) => payload.data.data.data)
		.catch((err) => {
			throw new CustomError({ ...err.response.data });
		});
};

export const getFeatureResolver = (parentValue, args) =>
	axios({
		method: 'GET',
		url: `http://localhost:4000${API_PREFIX}${API_FEATURES_ENDPOINT}/${args.id}`,
	})
		.then((payload) => payload.data.data.data)
		.catch((err) => {
			throw new CustomError({ ...err.response.data });
		});

export const getPropertyTypesResolver = (parentValue, args) => {
	const queryParams = queryParamEncoder({ params: args });

	return axios({
		method: 'GET',
		url: `http://localhost:4000${API_PREFIX}${API_PROPERTYTYPE_ENDPOINT}${queryParams}`,
	})
		.then((payload) => payload.data.data.data)
		.catch((err) => {
			throw new CustomError({ ...err.response.data });
		});
};

export const getPropertyTypeResolver = (parentValue, args) =>
	axios({
		method: 'GET',
		url: `http://localhost:4000${API_PREFIX}${API_PROPERTYTYPE_ENDPOINT}/${args.id}`,
	})
		.then((payload) => payload.data.data.data)
		.catch((err) => {
			throw new CustomError({ ...err.response.data });
		});

export const getAgenciesResolver = (parentValue, args) => {
	const queryParams = queryParamEncoder({ params: args });

	return axios({
		method: 'GET',
		url: `http://localhost:4000${API_PREFIX}${API_AGENCY_ENDPOINT}${queryParams}`,
	})
		.then((payload) => payload.data.data.data)
		.catch((err) => {
			throw new CustomError({ ...err.response.data });
		});
};

export const getAgencyResolver = (parentValue, args) =>
	axios({
		method: 'GET',
		url: `http://localhost:4000${API_PREFIX}${API_AGENCY_ENDPOINT}/${args.id}`,
	})
		.then((payload) => payload.data.data)
		.catch((err) => {
			throw new CustomError({ ...err.response.data });
		});
