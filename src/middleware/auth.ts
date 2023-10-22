import { NextFunction, Request, Response } from 'express';
const jsonwebtoken = require('jsonwebtoken');

import { ResponseAndLoggerWrapper } from '../logger/Logger';
import { TYPE_UNAUTHORIZED } from '../utils/constants';
import { AppDataSource } from '../data-source';
import { userInterface } from '../types';
import { User } from '../entity/User';

export const verifyAuthToken: (
	req: Request,
	res: Response,
	next: NextFunction
) => Promise<void | ResponseAndLoggerWrapper> = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const authToken = req?.headers?.authorization?.split(' ').at(-1);

	if (!authToken)
		return new ResponseAndLoggerWrapper({
			req,
			res,
			payload: {
				...TYPE_UNAUTHORIZED,
				details: 'Missing or Invalid token provided',
			},
		});

	// verify the token if valid
	jsonwebtoken.verify(
		authToken,
		process.env.JWT_ACCESS_TOKEN_SECRET!,
		async (err: Error, decoded: userInterface) => {
			if (err)
				return new ResponseAndLoggerWrapper({
					req,
					res,
					payload: {
						...TYPE_UNAUTHORIZED,
						details: 'Missing or Invalid token provided',
					},
				});

			const confirmUser = await AppDataSource.manager.findOne(User, {
				where: {
					id: decoded.id,
				},
			});

			if (
				!confirmUser ||
				decoded.first_name !== confirmUser.first_name ||
				decoded.perm.role !== (await confirmUser.perm).role ||
				decoded.last_name !== confirmUser.last_name ||
				decoded.id !== confirmUser.id
			)
				return new ResponseAndLoggerWrapper({
					res,
					req,
					payload: {
						...TYPE_UNAUTHORIZED,
						details: 'Missing or Invalid token provided',
					},
				});

			// set user
			req.user = { ...confirmUser, perm: await confirmUser.perm };

			return next();
		}
	);
};

export const verifyRefToken: (
	req: Request,
	res: Response,
	next: NextFunction
) => Promise<void | ResponseAndLoggerWrapper> = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// custom header to pick the refresh token
	const refToken = req?.headers['x-refresh-token'] as string;

	if (!refToken)
		return new ResponseAndLoggerWrapper({
			req,
			res,
			payload: {
				...TYPE_UNAUTHORIZED,
				details: 'Missing or invalid refresh token provided',
			},
		});

	// verify the token if valid
	jsonwebtoken.verify(
		refToken,
		process.env.JWT_REFRESH_TOKEN_SECRET!,
		async (err: Error, decoded: userInterface) => {
			if (err)
				return new ResponseAndLoggerWrapper({
					req,
					res,
					payload: {
						...TYPE_UNAUTHORIZED,
						details: 'Missing or Invalid refresh token provided',
					},
				});

			const confirmUser = await AppDataSource.manager.findOne(User, {
				where: {
					id: decoded.id,
				},
			});

			// confirm user
			return confirmUser
				? next()
				: new ResponseAndLoggerWrapper({
						res,
						req,
						payload: {
							...TYPE_UNAUTHORIZED,
						},
				  });
		}
	);
};
