import { NextFunction, Request, Response } from 'express';

import { TYPE_BAD_REQUEST } from '../utils/constants';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { ResponseAndLoggerWrapper } from '../logger/Logger';

export const checkIfUserExists: (
	req: Request,
	res: Response,
	next: NextFunction
) => void = (req: Request, res: Response, next: NextFunction) =>
	req.body.email_addr
		? AppDataSource.manager
				.findOne(User, {
					where: {
						profile: {
							email_addr: req.body.email_addr,
						},
					},
				})
				.then((user) =>
					user
						? new ResponseAndLoggerWrapper({
								req,
								res,
								payload: {
									...TYPE_BAD_REQUEST,
									data: [
										{
											msg: 'Email is in use by another account',
											field: 'email_addr',
										},
									],
								},
						  })
						: next()
				)
				.catch((err: Error) => next())
		: next();
