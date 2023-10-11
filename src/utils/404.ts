import { Request, Response } from 'express';

import { ResponseAndLoggerWrapper } from '../logger/Logger';
import { TYPE_NOT_FOUND } from './constants';

export const Error404: (
	req: Request,
	res: Response
) => ResponseAndLoggerWrapper = (req, res) =>
	new ResponseAndLoggerWrapper({
		payload: {
			...TYPE_NOT_FOUND,
			details: 'Invalid Enpoint',
		},
		req,
		res,
	});
