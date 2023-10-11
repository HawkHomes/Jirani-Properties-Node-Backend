import { oAUthCallBackHandler } from '../utils/common';

const googleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');
const passport = require('passport');

passport.use(
	new googleStrategy(
		{
			clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
			callbackURL: `${
				process.env.NODE_ENV === 'production'
					? 'https://ec2-54-162-179-153.compute-1.amazonaws.com'
					: 'http://localhost:4000'
			}/api/users/oauth/google/callback`,
			clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
		},
		async (accessToken, refreshToken, profile, cb) => {
			const { provider } = profile;

			const {
				given_name: first_name,
				family_name: last_name,
				email_verified: verified,
				email: email_addr,
				picture: avatar,
				sub: oauth_id,
			} = profile._json;

			return oAUthCallBackHandler({
				first_name,
				last_name,
				email_addr,
				oauth_id,
				provider,
				verified,
				avatar,
				cb,
			});
		}
	)
);

passport.use(
	new FacebookStrategy(
		{
			clientSecret: process.env.FACEBOOK_APP_SECRET,
			clientID: process.env.FACEBOOK_APP_ID,
			callbackURL: `${
				process.env.NODE_ENV === 'production'
					? 'https://ec2-54-162-179-153.compute-1.amazonaws.com'
					: 'http://localhost:4000'
			}/api/users/oauth/facebook/callback`,
		},
		async (accessToken, refreshToken, profile, cb) => {
			const { provider } = profile;

			const {
				name: {
					familyName: first_name,
					middleName: alt_second,
					givenName: last_name,
				},
				email: email_addr,
				profileUrl: avatar,
				id: oauth_id,
				displayName,
			} = profile;

			return oAUthCallBackHandler({
				first_name: first_name ?? displayName?.split(' ')?.at(0) ?? alt_second,
				last_name: last_name ?? displayName?.split(' ')?.at(1) ?? alt_second,
				email_addr: email_addr ?? null,
				avatar: avatar ?? '',
				verified: true,
				oauth_id,
				provider,
				cb,
			});
		}
	)
);
