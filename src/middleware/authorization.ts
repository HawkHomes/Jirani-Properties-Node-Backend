import { NextFunction, Request, Response } from 'express';
import { TypeORMError } from 'typeorm';

import { TYPE_INTERNAL_ERROR, TYPE_FORBIDDEN } from '../utils/constants';
import { ResponseAndLoggerWrapper } from '../logger/Logger';
import { AppDataSource } from '../data-source';
import { roleInterface } from '../types';
import { User } from '../entity/User';

export const isAdmin: (
	req: Request,
	res: Response,
	next: NextFunction
) => Promise<Response | any> = async (req, res, next) =>
	req.user.perm.role === roleInterface.Admin
		? next()
		: new ResponseAndLoggerWrapper({
				res,
				req,
				payload: {
					...TYPE_FORBIDDEN,
				},
		  });

export const isAdminOrIsLandowner: (
	req: Request,
	res: Response,
	next: NextFunction
) => Promise<Response | any> = async (req, res, next) => {
	const { pid } = req.params;

	req.user.perm.role === roleInterface.AdminAgent ||
	req.user.perm.role === roleInterface.Admin ||
	req.user.perm.role === roleInterface.Agent
		? next()
		: new ResponseAndLoggerWrapper({
				req,
				res,
				payload: {
					...TYPE_FORBIDDEN,
				},
		  });
};

export const isAdminOrAdminAgent: (
	req: Request,
	res: Response,
	next: NextFunction
) => Promise<Response | any> = async (req, res, next) => {
	const { id } = req.params;

	(req.user.perm.role === roleInterface.AdminAgent &&
		req.user.agency.id === id) ||
	req.user.perm.role === roleInterface.Admin
		? next()
		: new ResponseAndLoggerWrapper({
				res,
				req,
				payload: {
					...TYPE_FORBIDDEN,
				},
		  });
};

export const isAccUsable: (
	req: Request,
	res: Response,
	next: NextFunction
) => Promise<Response | any> = async (req, res, next) =>
	AppDataSource.manager
		.findOne(User, { where: { id: req.user.id } })
		.then((user) =>
			user.active
				? user.disabled
					? new ResponseAndLoggerWrapper({
							res,
							req,
							payload: {
								...TYPE_FORBIDDEN,
								details: 'Account is disabled',
							},
					  })
					: next()
				: new ResponseAndLoggerWrapper({
						res,
						req,
						payload: {
							...TYPE_FORBIDDEN,
							details: 'Account not activated',
						},
				  })
		)
		.catch(
			(err: TypeORMError) =>
				new ResponseAndLoggerWrapper({
					err,
					req,
					res,
					payload: {
						...TYPE_INTERNAL_ERROR,
					},
				})
		);

export const isAuthenticatedUser: (
	req: Request,
	res: Response,
	next: NextFunction
) => Promise<Response | any> = async (req, res, next) =>
	req.user.perm.role === roleInterface.USER
		? next()
		: new ResponseAndLoggerWrapper({
				payload: TYPE_FORBIDDEN,
				req,
				res,
		  });

export const isAdminOrUser: (
	req: Request,
	res: Response,
	next: NextFunction
) => Promise<Response | any> = async (req, res, next) =>
	req.user.perm.role === roleInterface.Admin ||
	req.user.perm.role === roleInterface.USER
		? next()
		: new ResponseAndLoggerWrapper({
				res,
				req,
				payload: {
					...TYPE_FORBIDDEN,
				},
		  });

export const isAnornymouseUser: (
	req: Request,
	res: Response,
	next: NextFunction
) => Promise<Response | any> = async (req, res, next) =>
	!req.user
		? next()
		: new ResponseAndLoggerWrapper({
				res,
				req,
				payload: {
					...TYPE_FORBIDDEN,
				},
		  });
