import { Request, Response, Router } from 'express';

import { TYPE_OK, TYPE_UNAUTHORIZED } from '../utils/constants';
import { ResponseAndLoggerWrapper } from '../logger/Logger';
const passport = require('passport');

const router = Router();

router.get(
	'/google',
	passport.authenticate('google', {
		scope: ['profile', 'openid', 'email'],

		failureRedirect: '/login',
		failureFlash: true, // Enable flash messages for failure
	})
);

// passport
router.get(
	'/google/callback/',
	passport.authenticate('google', { session: false }),
	(req: Request, res: Response) => {
		return req.user
			? new ResponseAndLoggerWrapper({
					payload: { ...TYPE_OK, data: req.user },
					req,
					res,
			  })
			: new ResponseAndLoggerWrapper({
					req,
					res,
					payload: {
						...TYPE_UNAUTHORIZED,
						details: 'There was a problem autheticating your account',
					},
			  });
	}
);

router.get(
	'/facebook',
	passport.authenticate('facebook', {
		scope: [
			'public_profile',
			// 'offline_access',
			// 'openid',
			// 'profile',
			// 'email',
		],

		failureRedirect: '/login',
		failureFlash: true, // Enable flash messages for failure
	})
);

// passport
router.get(
	'/facebook/callback',
	passport.authenticate('facebook', { session: false }),
	(req: Request, res: Response) =>
		req.user
			? new ResponseAndLoggerWrapper({
					req,
					res,
					payload: {
						...TYPE_OK,
						data: req.user,
					},
			  })
			: new ResponseAndLoggerWrapper({
					req,
					res,
					payload: {
						...TYPE_UNAUTHORIZED,
						details: 'There was a problem autheticating your account',
					},
			  })
);

module.exports = router;
