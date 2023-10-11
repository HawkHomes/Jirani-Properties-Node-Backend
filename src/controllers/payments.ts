import { Request, Response } from 'express';

import { TYPE_OK } from './../utils/constants';
import { ResponseAndLoggerWrapper } from '../logger/Logger';

export const requestPayment: (req: Request, res: Response) => any = (
	req,
	res
) =>
	new ResponseAndLoggerWrapper({
		res,
		req,
		payload: {
			...TYPE_OK,
			data: { token: req.mpesaAuthToken, phone: req.body.phone },
		},
	});
