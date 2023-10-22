import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

import {
	DeleteObjectsCommand,
	DeleteObjectsCommandInput,
	PutObjectAclCommandInput,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Point, TypeORMError } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { createRequire } from 'module';
import * as jwt from 'jsonwebtoken';
import { readdirSync } from 'fs';
const Twilio = require('twilio');

// dev deps
import { API_PREFIX, TYPE_BAD_REQUEST, TYPE_OK } from './constants';
import { ResponseAndLoggerWrapper } from '../logger/Logger';
import { CustomErrorType } from '../graphql/schema/types';
import { PasswordReset } from '../entity/PasswordReset';
import { AppDataSource } from '../data-source';
import { Profile } from '../entity/Profile';
import { Perm } from '../entity/Perm';
import { User } from '../entity/User';
import {
	dirFileReaderParamsInterface,
	queryParamEncoderInterface,
	dynamicKeysInterface,
	responseInterface,
	coordsInterface,
	emailInterface,
	smsInterface,
	roleInterface,
} from './../types';

export const responseWrapper: (
	res: Response,
	{ status, title, data, details }: responseInterface
) => Response = (
	res,
	{ status, data, title, type, details }: responseInterface
) => res.status(status).json({ title, status, details, data, type });

export const checkValidationRules: (
	req: Request,
	res: Response,
	next: NextFunction
) => void | ResponseAndLoggerWrapper = (req, res, next) => {
	const valErrors = validationResult(req);

	return valErrors.isEmpty()
		? next()
		: new ResponseAndLoggerWrapper({
				req,
				res,
				payload: {
					...TYPE_BAD_REQUEST,
					data: valErrors
						.array({ onlyFirstError: true })
						.map(({ param, msg }) => ({
							field: param,
							msg,
						})),
				},
		  });
};

export const sendMail: ({
	email_addr,
	template,
	subject,
}: emailInterface) => Promise<void> = async ({
	email_addr,
	template,
	subject,
}: emailInterface) => {
	const transport = await nodemailer.createTransport({
		port: parseInt(process.env.MAIL_SERVER_PORT),
		host: process.env.MAIL_SERVER_HOST,
		secure: true,
		auth: {
			user: process.env.MAIL_SERVER_EMAIL,
			pass: process.env.MAIL_SERVER_PASS,
		},
	});

	var mailOptions = {
		from: `${process.env.COMPANY_NAME} <${process.env.MAIL_SERVER_EMAIL}>`,
		to: email_addr,
		subject,
		headers: {
			priority: 'high',
		},
		html: template,
	};

	await transport.sendMail(
		mailOptions,
		(error: any, info: { response: string }) =>
			error ? console.log(error) : console.log('Email sent: a' + info.response)
	);
};

export const sendSms: ({ phone, msg }: smsInterface) => void = ({
	phone,
	msg,
}) => {
	const client = Twilio(
		process.env.TWILIO_ACC_SID,
		process.env.TWILIO_AUTH_TOKEN
	);

	// crete the message
	client.messages
		.create({
			from: process.env.TWILIO_ACC_PHONE,
			to: `+${phone}`,
			body: msg,
		})
		.then((payload: any) =>
			console.log('Message send sucessfully to: ', payload.to)
		)
		.catch(async (err: Error) => console.log(err.message));
};

// geneerate 6 digits random numbers
export const generateOtp: () => number = () =>
	Math.floor(Math.random() * 1000000);

export const genAccessToken: (user: any) => string = (user) => {
	delete user.__perm__;

	return jwt.sign(user, process.env.JWT_ACCESS_TOKEN_SECRET, {
		expiresIn: process.env.JWT_TOKEN_EXPIRY,
	});
};

export const genRefreshToken: (user: any) => string = (user) =>
	jwt.sign(user, process.env.JWT_REFRESH_TOKEN_SECRET, {
		expiresIn: process.env.JWT_TOKEN_RTOKEN_EXPIRY,
	});

export const getWKTCoords: ({ long, lat }: coordsInterface) => Point = ({
	long,
	lat,
}) => ({ type: 'Point', coordinates: [long, lat] });

export const dirFileReader = ({
	baseRoute: base_route,
	// get default export
	defaultExport = true,
	// return array ?
	array = true,
	ignoreFiles,
}: dirFileReaderParamsInterface) => {
	const customRequire = createRequire(__filename);
	const foundExports = [];

	// read the files in the docs folder
	const fileRead = readdirSync(`${base_route}`).filter(
		(singleRoute) => !ignoreFiles.includes(`${base_route}/${singleRoute}`)
	);

	if (!array)
		fileRead.map(
			(
				singleRoute // append each import to the foundExports variable
			) =>
				//check if the default export is required or not.
				defaultExport
					? foundExports.push(
							customRequire(`${base_route}/${singleRoute}`).default
					  )
					: foundExports.push(customRequire(`${base_route}/${singleRoute}`))
		);

	// reduce the imports into a single object and export it as a file export
	return array
		? fileRead
		: foundExports.reduce((prev, curr) => ({ ...prev, ...curr }), {});
};

export const rootServerHandler = (req, res) =>
	new ResponseAndLoggerWrapper({
		req,
		res,
		payload: {
			...TYPE_OK,
			details: `Server is running on  http://localhost:${process.env.SERVER_PORT}${API_PREFIX} 😎`,
		},
	});

export const queryParamEncoder = ({
	currIter = 0,
	prevKey,
	params,
}: queryParamEncoderInterface) => {
	currIter++;
	const consolidatedParams = [];

	if (typeof params === 'object') {
		for (const [key, value] of Object.entries(params)) {
			if (Array.isArray(value)) {
				consolidatedParams.push(
					value
						.map((item) => `${key}[]=${encodeURIComponent(String(item))}`)
						.join('&')
				);

				continue;
			}

			if (typeof value === 'object' && value !== null) {
				consolidatedParams.push(
					queryParamEncoder({
						params: <
							dynamicKeysInterface<
								dynamicKeysInterface<string | number> | string | Array<Number>
							>
						>value,
						prevKey: key,
						currIter,
					})
				);
				continue;
			}

			if (
				Number.isFinite(value) ||
				typeof value === 'string' ||
				typeof value === 'boolean'
			) {
				const objectKey = prevKey ? `${prevKey}[${key}]` : key;

				consolidatedParams.push(
					`${objectKey}=${encodeURIComponent(String(value))}`
				);
				continue;
			}

			throw `Invalid component: ${key}: ${value} provided`;
		}

		if (
			Number.isFinite(params) ||
			typeof params === 'string' ||
			typeof params === 'boolean'
		) {
			const objectKey = prevKey ? `${prevKey}[${params}]` : params;

			consolidatedParams.push(
				`${objectKey}=${encodeURIComponent(String(params))}`
			);
		}
	}

	// currIter;

	return consolidatedParams.length > 0
		? currIter > 1
			? consolidatedParams.join('&')
			: '?' + consolidatedParams.join('&')
		: '';
};

export class CustomError extends Error {
	extensions: {};
	constructor({ type = 'Error', details, ...rest }: CustomErrorType) {
		super(details);
		this.name = type;

		this.extensions = {
			type,
			...rest,
		};
	}
}

export const oAUthCallBackHandler = async ({
	first_name,
	last_name,
	email_addr,
	provider,
	verified,
	oauth_id,
	avatar,
	cb,
}: {
	email_addr?: string;
	first_name: string;
	last_name: string;
	verified: boolean;
	provider: string;
	oauth_id: string;
	avatar: string;
	cb: any;
}) => {
	const entityManager = AppDataSource.manager
		.getRepository(User)
		.createQueryBuilder('user')
		.leftJoinAndSelect('user.perm', 'perm')
		.leftJoinAndSelect('user.profile', 'profile')
		.where('user.oauth_id =:oauth_id', { oauth_id });

	if (email_addr)
		entityManager.orWhere('profile.email_addr =:email_addr', { email_addr });

	const userExists = await entityManager.getOne();

	if (userExists) {
		delete userExists.password;
		delete userExists.disabled;
		delete userExists.active;

		const role = await userExists.perm;

		const refreshToken = genRefreshToken({
			...userExists,
			role: { role: role.role },
		});

		const accessToken = genAccessToken({
			...userExists,
			perm: { role: role.role },
		});
		return cb(null, { accessToken, refreshToken });
	}

	//admin
	const defaultPerm = await AppDataSource.manager
		.getRepository(Perm)
		.createQueryBuilder('perm')
		.where('perm.role =:role', {
			role: roleInterface.USER,
		})
		.getOne();

	if (!defaultPerm) cb(null, 'Internal Server Error');

	const defaultUser = new User();

	const prof = new Profile();

	prof.email_addr = email_addr;
	prof.avatar = avatar;
	prof.kra_pin = '';
	prof.id_no = 0;

	defaultUser.perm = defaultPerm;
	defaultUser.profile = prof;

	defaultUser.verified = verified ?? false;
	defaultUser.active = verified ?? false;
	defaultUser.first_name = first_name;
	defaultUser.last_name = last_name;

	defaultUser.oauth_provider = provider;
	defaultUser.oauth_id = oauth_id;

	return AppDataSource.manager
		.save(defaultUser)
		.then(async (savedUser) => {
			delete savedUser.password;
			delete savedUser.disabled;
			delete savedUser.active;

			const role = await savedUser.perm;

			const refreshToken = genRefreshToken({
				...savedUser,
				role: { role: role.role },
			});

			const accessToken = genAccessToken({
				...savedUser,
				perm: { role: role.role },
			});

			return cb(null, { accessToken, refreshToken });
		})
		.catch((err: TypeORMError) => cb(null, err.message));
};

export const deleteOutdatedPasswordRecords = async () => {
	const oneHourAgo = new Date();
	oneHourAgo.setHours(oneHourAgo.getHours() - 1);

	return AppDataSource.getRepository(PasswordReset)
		.createQueryBuilder()
		.delete()
		.from(PasswordReset)
		.where('created <=:oneHourAgo', { oneHourAgo })
		.orWhere('updated <=:oneHourAgo', { oneHourAgo })
		.execute()
		.then(console.log)
		.catch(console.log);
};

export const awsBucketPut = async ({
	s3: client,
	configs,
}: {
	configs: PutObjectAclCommandInput;
	s3: S3Client;
}) => getSignedUrl(client, new PutObjectCommand(configs), { expiresIn: 60 });

export const awsDeleteItem = async ({
	s3: client,
	configs,
}: {
	configs: DeleteObjectsCommandInput;
	s3: S3Client;
}) => {
	return client
		.send(new DeleteObjectsCommand(configs))
		.then((payload) => {
			console.log(payload);
			client.destroy();
		})
		.catch(console.log);
};

export const awsSendMail: ({
	email_addr,
	template,
	subject,
}: emailInterface) => Promise<void> = async ({
	email_addr,
	template,
	subject,
}: emailInterface) => {
	const sesClient = new SESClient({
		credentials: {
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_SES,
			accessKeyId: process.env.AWS_ACCESS_KEY_ID_SES,
		},
		region: process.env.SES_REGION,
	});

	const mailSenderCommand = new SendEmailCommand({
		Destination: {
			ToAddresses: [email_addr],
			BccAddresses: [],
			CcAddresses: [],
		},
		Message: {
			Body: {
				Html: {
					Charset: 'UTF-8',
					Data: template,
				},
				// Text: {
				// 	Charset: 'UTF-8',
				// 	Data: 'Hello world',
				// },
			},
			Subject: {
				Charset: 'UTF-8',
				Data: subject,
			},
		},
		ReplyToAddresses: [],
		Source: 'noreply@jiraniproperties.com',
	});

	sesClient
		.send(mailSenderCommand)
		.then((p) => {
			sesClient.destroy();

			console.log(p);
		})
		.catch(console.log);
};
