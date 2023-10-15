import { Equal, FindOptionsWhere, TypeORMError } from 'typeorm';
import { Request, Response } from 'express';
const bcrypt = require('bcrypt');

import { ActivateAccount } from './../entity/Activate';
import { AppDataSource } from './../data-source';
import { Profile } from '../entity/Profile';

import {
	userProfileInterface,
	userInterface,
	roleInterface,
	otpInterface,
	PasswordResetInterface,
} from '../types';

import { genRefreshToken, genAccessToken } from '../utils/common';

import { Perm } from '../entity/Perm';
import { User } from '../entity/User';

import {
	TYPE_INTERNAL_ERROR,
	TYPE_UNAUTHORIZED,
	TYPE_BAD_REQUEST,
	TYPE_NO_CONTENT,
	TYPE_FORBIDDEN,
	TYPE_NOT_FOUND,
	TYPE_OK,
	TYPE_ITEM_CREATED,
} from './../utils/constants';
import { ResponseAndLoggerWrapper } from '../logger/Logger';
import { PasswordReset } from '../entity/PasswordReset';

// #create acc
export const createAccount: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const {
		first_name,
		email_addr,
		is_landlord,
		last_name,
		avatar = '',
		password,
		kra_pin,
		phone,
		id_no,
	}: Omit<userInterface, 'profile'> &
		Pick<
			userProfileInterface,
			'kra_pin' | 'id_no' | 'avatar' | 'email_addr' | 'phone'
		> = req.body;

	const prof = new Profile();

	prof.email_addr = email_addr;
	prof.avatar = avatar ?? '';
	prof.kra_pin = kra_pin;
	prof.phone = phone;
	prof.id_no = id_no;

	const user = new User();

	user.first_name = first_name;
	user.last_name = last_name;
	user.password = password;
	user.profile = prof;

	if (is_landlord)
		user.perm = await AppDataSource.manager.findOne(Perm, {
			where: {
				role: roleInterface.Agent,
			},
		});
	else
		user.perm = await AppDataSource.manager.findOne(Perm, {
			where: {
				role: roleInterface.USER,
			},
		});

	return AppDataSource.manager
		.save(user)
		.then((savedUser) => {
			delete savedUser.password;
			return new ResponseAndLoggerWrapper({
				req,
				res,
				payload: {
					...TYPE_ITEM_CREATED,
					data: savedUser,
				},
			});
		})
		.catch(
			(err: TypeORMError) =>
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

// activate account
export const accountActivation: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { otp }: otpInterface = req.params;

	const condition: FindOptionsWhere<ActivateAccount> = {
		otp,
	};

	const foundOtp: ActivateAccount = await AppDataSource.manager.findOne(
		ActivateAccount,
		{
			where: condition,
		}
	);

	if (!foundOtp)
		return new ResponseAndLoggerWrapper({
			req,
			res,
			payload: {
				...TYPE_BAD_REQUEST,
				details: 'Expired or Invalid Otp',
			},
		});

	const userCondition = {
		uid: foundOtp.user.uid,
	};

	const myManager = AppDataSource.getRepository(User)
		.createQueryBuilder('user')
		.innerJoinAndSelect('user.profile', 'profile')
		.innerJoinAndSelect('user.perm', 'role')
		.select([
			'profile.email_addr',
			'user.first_name',
			'user.last_name',
			'user.password',
			'profile.avatar',
			'profile.phone',
			'user.verified',
			'user.disabled',
			'user.active',
			'role.role',
			'user.uid',
		])
		.where('user.uid =:uid', { uid: foundOtp.user.uid });

	const foundUser = await myManager.getOne();

	if (!foundUser)
		return new ResponseAndLoggerWrapper({
			req,
			res,
			payload: {
				...TYPE_BAD_REQUEST,
				details: 'Expired or Invalid Otp',
			},
		});

	if (foundUser?.disabled)
		return new ResponseAndLoggerWrapper({
			req,
			res,
			payload: {
				...TYPE_FORBIDDEN,
				details: 'Account has been disabled',
			},
		});

	return AppDataSource.manager
		.update(User, userCondition, { active: true })
		.then(async (payload) => {
			delete foundUser.password;
			delete foundUser.disabled;
			delete foundUser.active;

			// delete the otp
			await AppDataSource.manager.remove(foundOtp);

			const role = await foundUser.perm;

			const refreshToken = genRefreshToken({
				...foundUser,
				role: { role: role.role },
			});

			const accessToken = genAccessToken({
				...foundUser,
				perm: { role: role.role },
			});

			// await AppDataSource.manager.update(
			// 	User,
			// 	{ uid: foundUser.uid},
			// 	{ refToken: refreshToken }
			// );

			return new ResponseAndLoggerWrapper({
				res,
				req,
				payload: {
					data: {
						accessToken,
						refreshToken,
					},
					...TYPE_OK,
				},
			});
		})
		.catch(
			(err: TypeORMError) =>
				new ResponseAndLoggerWrapper({
					res,
					err,
					req,
					payload: {
						...TYPE_BAD_REQUEST,
						details: 'Account activation failed',
					},
				})
		);
};

export const PasswordResetRequest: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const {
		email_addr,
		phone,
	}: Pick<userProfileInterface, 'email_addr' | 'phone'> = req.body;

	const foundUser = await AppDataSource.getRepository(User)
		.createQueryBuilder('user')
		.leftJoinAndSelect('user.profile', 'profile')
		.where('profile.email_addr =:email_addr', { email_addr })
		.getOne();

	if (!foundUser)
		return new ResponseAndLoggerWrapper({
			res,
			req,
			payload: {
				...TYPE_BAD_REQUEST,
				details: "User with the specified email address doesn't exists",
			},
		});

	const newResetInfo =
		(await AppDataSource.getRepository(PasswordReset)
			.createQueryBuilder('password_reset')
			.leftJoinAndSelect('password_reset.user', 'user')
			.where('user.uid =:uid', { uid: foundUser.uid })
			.getOne()) || new PasswordReset();

	//update the user info
	newResetInfo.user = foundUser;
	newResetInfo.token = null;

	return AppDataSource.manager
		.save(newResetInfo)
		.then(
			(payload) =>
				new ResponseAndLoggerWrapper({
					res,
					req,
					payload: {
						...TYPE_OK,
					},
				})
		)
		.catch(
			(err) =>
				new ResponseAndLoggerWrapper({
					res,
					req,
					err,
					payload: {
						...TYPE_INTERNAL_ERROR,
					},
				})
		);
};

export const PasswordResetHandler: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const oneHourAgo = new Date();
	oneHourAgo.setHours(oneHourAgo.getHours() - 1);

	const { password, token }: PasswordResetInterface = req.body;

	const foundResetTokenUser = await AppDataSource.getRepository(User)
		.createQueryBuilder('user')
		.leftJoinAndSelect('user.pass_reset', 'pass_reset')
		.where('pass_reset.token =:token', { token })
		//the token must be an hour or less
		.andWhere('pass_reset.created >=:oneHourAgo', { oneHourAgo })
		.getOne()
		.then(async (data) => {
			//delete the user password entry
			await AppDataSource.manager
				.delete(PasswordReset, { token })
				.catch(console.log);

			return data;
		});

	if (!foundResetTokenUser)
		return new ResponseAndLoggerWrapper({
			req,
			res,
			payload: {
				...TYPE_BAD_REQUEST,
				details: 'Expired or invalid token provided',
			},
		});

	foundResetTokenUser.password = password;

	return AppDataSource.getRepository(User)
		.save(foundResetTokenUser)
		.then(
			(payload) =>
				new ResponseAndLoggerWrapper({
					req,
					res,
					payload: {
						...TYPE_OK,
					},
				})
		)
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

// sign in
export const signIn: (req: Request, res: Response) => Promise<any> = async (
	req,
	res
) => {
	// destructure the req body
	const { phone, email_addr, password } = req.body;

	const myManager = AppDataSource.getRepository(User)
		.createQueryBuilder('user')
		.innerJoinAndSelect('user.profile', 'profile')
		.innerJoinAndSelect('user.perm', 'role')
		.select([
			'profile.email_addr',
			'user.first_name',
			'user.last_name',
			'user.password',
			'profile.avatar',
			'profile.phone',
			'user.verified',
			'user.disabled',
			'user.active',
			'role.role',
			'user.uid',
		]);

	if (email_addr)
		myManager.where('profile.email_addr =:email_addr', {
			email_addr,
		});

	if (phone && !email_addr) myManager.where('profile.phone =:phone', { phone });

	// find user by filter.
	const user = await myManager.getOne();

	if (!user)
		return new ResponseAndLoggerWrapper({
			req,
			res,
			payload: {
				...TYPE_UNAUTHORIZED,
				details: 'Email and password combination is not valid',
			},
		});

	if (!user?.active)
		return new ResponseAndLoggerWrapper({
			req,
			res,
			payload: {
				...TYPE_FORBIDDEN,
				details: 'Account is not activated',
			},
		});

	if (user?.disabled)
		return new ResponseAndLoggerWrapper({
			req,
			res,
			payload: {
				...TYPE_FORBIDDEN,
				details: 'Account has been disabled',
			},
		});

	// check if user is exists
	return bcrypt.compare(password, user.password, (err, results) => {
		// if error send error message to frontend
		if (err)
			return new ResponseAndLoggerWrapper({
				req,
				res,
				err,
				payload: {
					...TYPE_UNAUTHORIZED,
					details: 'username and password combination did not match.',
				},
			});

		results
			? (async () => {
					delete user.password;
					delete user.disabled;
					delete user.active;

					const role = await user.perm;

					const refreshToken = genRefreshToken({
						...user,
						role: { role: role.role },
					});

					const accessToken = genAccessToken({
						...user,
						perm: { role: role.role },
					});

					await AppDataSource.manager
						.createQueryBuilder()
						.update(User)
						.set({ refToken: refreshToken })
						.where('uid = :id', { id: user.uid })
						.execute();

					return new ResponseAndLoggerWrapper({
						req,
						res,
						payload: {
							data: {
								accessToken,
								refreshToken,
							},
							...TYPE_OK,
						},
					});
			  })()
			: new ResponseAndLoggerWrapper({
					res,
					req,
					payload: {
						...TYPE_UNAUTHORIZED,
						details: 'Email and password combination is not valid',
					},
			  });
	});
};

export const signOut: (req: Request, res: Response) => Promise<any> = async (
	req,
	res
) => {
	const condition: FindOptionsWhere<User> = { uid: req.user.uid };

	const user = await AppDataSource.manager.findOne(User, {
		where: condition,
	});

	if (!user)
		return new ResponseAndLoggerWrapper({
			payload: TYPE_NOT_FOUND,
			req,
			res,
		});

	return AppDataSource.manager
		.update(User, condition, {
			refToken: null,
		})
		.then(
			() =>
				new ResponseAndLoggerWrapper({
					req,
					res,
					payload: {
						...TYPE_NO_CONTENT,
					},
				})
		)
		.catch(
			(err: TypeORMError) =>
				new ResponseAndLoggerWrapper({
					payload: TYPE_INTERNAL_ERROR,
					req,
					err,
					res,
				})
		);
};

// export const refreshToken: (
// 	req: Request,
// 	res: Response
// ) => Promise<any> = async (req, res) => {
// 	const refToken: string = `${req?.headers['x-refresh-token']}`;

// 	return AppDataSource.manager
// 		.findOne(User, {
// 			where: { refToken: Equal(refToken) },
// 			select: {
// 				first_name: true,
// 				last_name: true,
// 				profile: {
// 					email_addr: true,
// 				},
// 				password: true,
// 				uid: true,
// 			},
// 		})
// 		.then(
// 			(foundUser) =>
// 				new ResponseAndLoggerWrapper({
// 					req,
// 					res,
// 					payload: foundUser
// 						? {
// 								...TYPE_OK,
// 								data: genAccessToken(foundUser),
// 						  }
// 						: {
// 								...TYPE_UNAUTHORIZED,
// 								details: 'Token expired',
// 						  },
// 				})
// 		)
// 		.catch(
// 			(err: TypeORMError) =>
// 				new ResponseAndLoggerWrapper({
// 					req,
// 					err,
// 					res,
// 					payload: {
// 						...TYPE_INTERNAL_ERROR,
// 					},
// 				})
// 		);
// };

// update account
export const updateAccount: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { phone, email_addr, avatar, id_no, kra_pin, password } = req.body;

	const currUser = await AppDataSource.manager.findOne(User, {
		where: { uid: req.user.uid },
	});

	if (email_addr) currUser.profile.email_addr = email_addr;
	if (kra_pin) currUser.profile.kra_pin = kra_pin;
	if (password) currUser.password = password;
	if (avatar) currUser.profile.avatar = avatar;
	if (phone) currUser.profile.phone = phone;
	if (id_no) currUser.profile.id_no = id_no;

	return AppDataSource.manager
		.save(currUser)
		.then(
			() =>
				new ResponseAndLoggerWrapper({
					payload: TYPE_NO_CONTENT,
					req,
					res,
				})
		)
		.catch(
			(err: Error) =>
				new ResponseAndLoggerWrapper({
					err,
					req,
					res,
					payload: {
						...TYPE_INTERNAL_ERROR,
					},
				})
		);
};

// get current user info
export const getCurrentUser: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const condition = {
		uid: Equal(req.user.uid),
	};

	return AppDataSource.manager
		.findOne(User, {
			where: condition,
		})
		.then(
			(user) =>
				new ResponseAndLoggerWrapper({
					req,
					res,
					payload: {
						...TYPE_OK,
						data: user,
					},
				})
		)
		.catch(
			(err: Error) =>
				new ResponseAndLoggerWrapper({
					payload: TYPE_INTERNAL_ERROR,
					err,
					req,
					res,
				})
		);
};

// get all users
export const getUser: (req: Request, res: Response) => Promise<any> = async (
	req,
	res
) => {
	const { uid } = req.params;

	const manager = AppDataSource.manager
		.getRepository(User)
		.createQueryBuilder('user')
		.leftJoinAndSelect('user.profile', 'profile')
		.where('user.uid =:uid', { uid });

	return manager
		.getOne()
		.then(
			(data) =>
				new ResponseAndLoggerWrapper({
					req,
					res,
					payload: {
						data,
						...TYPE_OK,
					},
				})
		)
		.catch(
			(err: Error) =>
				new ResponseAndLoggerWrapper({
					payload: TYPE_BAD_REQUEST,
					req,
					err,
					res,
				})
		);
};

// get all users
export const getAllUsers: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const {
		first_name,
		last_name,
		email_addr,
		limit = 10,
		page = 1,
		kra_pin,
		phone,
		id_no,
		uid,
	} = req.query;

	const manager = AppDataSource.manager
		.getRepository(User)
		.createQueryBuilder('user')
		.leftJoinAndSelect('user.profile', 'profile')
		.where('user.uid !=:currUId', { currUId: req.user.uid });

	if (last_name) manager.andWhere('user.last_name =:last_name', { last_name });

	if (first_name)
		manager.andWhere('user.first_name =:first_name', { first_name });

	if (uid) manager.andWhere('user.uid =:uid', { uid });

	if (email_addr)
		manager.andWhere('profile.email_addr =:email_addr', { email_addr });

	if (kra_pin) manager.andWhere('profile.kra_pin =:uid', { kra_pin });

	if (phone) manager.andWhere('profile.phone =:uid', { phone });

	if (id_no) manager.andWhere('profile.id_no =:uid', { id_no });

	return manager
		.skip((parseInt(page as string) - 1) * parseInt(limit as string))
		.limit(parseInt(limit as string))
		.orderBy('user.date_added', 'ASC')
		.getManyAndCount()
		.then(
			([data, count]) =>
				new ResponseAndLoggerWrapper({
					req,
					res,
					payload: {
						data: { data, count },
						...TYPE_OK,
					},
				})
		)
		.catch(
			(err: Error) =>
				new ResponseAndLoggerWrapper({
					payload: TYPE_BAD_REQUEST,
					req,
					err,
					res,
				})
		);
};

// delete user
export const deleteUser: (req: Request, res: Response) => Promise<any> = async (
	req,
	res
) => {
	const condition = {
		uid: req.user.uid,
	};

	return AppDataSource.manager
		.softDelete(User, condition)
		.then(
			() =>
				new ResponseAndLoggerWrapper({
					req,
					res,
					payload: {
						...TYPE_NO_CONTENT,
					},
				})
		)
		.catch(
			(err: Error) =>
				new ResponseAndLoggerWrapper({
					res,
					req,
					err,
					payload: {
						...TYPE_INTERNAL_ERROR,
					},
				})
		);
};

// delete given user
export const removeUser: (req: Request, res: Response) => Promise<any> = async (
	req,
	res
) => {
	const { uid } = req.params;

	return AppDataSource.manager
		.softDelete(User, {
			uid,
		})
		.then(
			() =>
				new ResponseAndLoggerWrapper({
					payload: TYPE_NO_CONTENT,
					req,
					res,
				})
		)
		.catch(
			(err: Error) =>
				new ResponseAndLoggerWrapper({
					payload: TYPE_INTERNAL_ERROR,
					req,
					err,
					res,
				})
		);
};
