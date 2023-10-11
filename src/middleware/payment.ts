import { NextFunction, Request, Response } from 'express';
import axios from 'axios';

import { TYPE_INTERNAL_ERROR } from './../utils/constants';
import { ResponseAndLoggerWrapper } from '../logger/Logger';

declare module 'express-serve-static-core' {
	interface Request {
		mpesaAuthToken: string;
	}
}

// get token
export const getMpesaOAuth: (
	req: Request,
	res: Response,
	next: NextFunction
) => any = (req, res, next) => {
	const authBuffer = Buffer.from(
		`${process.env.SAF_CONSUMER_KEY}:${process.env.SAF_CONSUMER_SECRET}`
	);

	return axios
		.get(process.env.OAUTH_TOKEN_URL, {
			headers: { Authorization: `Basic ${authBuffer.toString('base64')}` },
		})
		.then(({ data: { access_token } }) => {
			req.mpesaAuthToken = access_token;
			next();
		})
		.catch(
			(err) =>
				new ResponseAndLoggerWrapper({
					req,
					res,
					err,
					payload: {
						...TYPE_INTERNAL_ERROR,
					},
				})
		);
};
