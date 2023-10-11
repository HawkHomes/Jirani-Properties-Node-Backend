import { Express, NextFunction, Request, Response } from 'express';
import { createRequire } from 'module';
const express = require('express');

import { API_PREFIX } from '../utils/constants';
import { Error404 } from './../utils/404';

import {
	rootServerHandler,
	dirFileReader,
	checkValidationRules,
} from './../utils/common';
import { getAllHouses, getSingleSingleHouse } from '../controllers/house';
import { houseQueryValidator, houseUUIDValidator } from '../validators/house';

const wrapper = (app: Express) => {
	const base_route = __dirname;

	// mount get request for all houses irrespective of their property
	app.get(
		`${API_PREFIX}/houses`,
		houseQueryValidator,
		checkValidationRules,
		getAllHouses
	);

	app.get(
		`${API_PREFIX}/houses/:hid`,
		houseUUIDValidator,
		checkValidationRules,
		getSingleSingleHouse
	);

	const customRequire = createRequire(__filename);
	// static files routing
	app.use(
		`${API_PREFIX}/photos/`,
		(req: Request, res: Response, next: NextFunction) => {
			res.setHeader('Content-Disposition', 'inline');
			next();
		},
		express.static(base_route + '/../photos')
	);

	// auto load routes and mount on the server
	dirFileReader({
		ignoreFiles: [
			__filename,
			`${base_route}/houses.ts`,
			`${base_route}/houses.js`,
			`${base_route}/oauth.ts`,
			`${base_route}/oauth.js`,
		],
		baseRoute: base_route,
	}).forEach((singleRoute) => {
		const fileAbsolutePath = `${base_route}/${singleRoute}`;

		app.use(
			`${API_PREFIX}/${singleRoute.toLowerCase().split('.').at(0)}`,
			customRequire(fileAbsolutePath).default
		);
	});

	app.get(`${API_PREFIX}`, rootServerHandler);

	// 404 endpoint
	app.use('*', Error404);
};

export default wrapper;
