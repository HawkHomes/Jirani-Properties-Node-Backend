import { Router } from 'express';

import {
	accountActivation,
	getUser,
	PasswordResetHandler,
	PasswordResetRequest,
	signOut,
} from '../controllers/user';
import { isAccUsable } from '../middleware/authorization';
import { checkIfUserExists } from '../middleware/base';
import { verifyAuthToken } from '../middleware/auth';
import { checkValidationRules } from '../utils/common';
import { isAdmin } from '../middleware/authorization';
import {
	forgotPasswordHandlerValidator,
	forgotPasswordValidator,
	updateUserValidator,
	userOTPValidator,
	userSignInValidator,
	userSignUpValidator,
	userUUIDValidator,
} from '../validators/user';
import { Error404 } from '../utils/404';
const oauth = require('./oauth');

import {
	getCurrentUser,
	createAccount,
	updateAccount,
	getAllUsers,
	removeUser,
	deleteUser,
	signIn,
} from '../controllers/user';

// base router
const router = Router();

//oauth login or signups
router.use('/oauth', oauth);

// all user
router.get('/', verifyAuthToken, isAdmin, isAccUsable, getAllUsers);

// sign in
router.post('/signin', userSignInValidator, checkValidationRules, signIn);

// add user
router.post(
	'/create',
	userSignUpValidator,
	checkValidationRules,
	checkIfUserExists,
	createAccount
);

router.post(
	'/reset',
	forgotPasswordValidator,
	checkValidationRules,
	PasswordResetRequest
);

router.post(
	'/reset/complete',
	forgotPasswordHandlerValidator,
	checkValidationRules,
	PasswordResetHandler
);

// delete user
router.delete(
	'/delete/:uid',
	verifyAuthToken,
	isAccUsable,
	isAdmin,
	userUUIDValidator,
	checkValidationRules,
	removeUser
);

// sign out
router.delete('/signout', verifyAuthToken, isAccUsable, signOut);

// refresh token
// router.post('/refresh', verifyRefToken, isAccUsable, refreshToken);

// get currently loggined user
router.get('/profile', verifyAuthToken, isAccUsable, getCurrentUser);

// update
router.put(
	'/update',
	verifyAuthToken,
	isAccUsable,
	updateUserValidator,
	checkValidationRules,
	checkIfUserExists,
	updateAccount
);

// delete user
router.delete('/delete/', verifyAuthToken, isAccUsable, deleteUser);

// activate account
router.post(
	'/activate/:otp/',
	userOTPValidator,
	checkValidationRules,
	accountActivation
);

// get single user
router.get(
	'/:uid',
	verifyAuthToken,
	isAdmin,
	isAccUsable,
	userUUIDValidator,
	checkValidationRules,
	getUser
);

// 404 endpoint
router.use('*', Error404);

export default router;
