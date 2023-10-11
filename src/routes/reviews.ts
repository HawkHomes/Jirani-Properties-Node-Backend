import { Router } from 'express';

import {
	isAuthenticatedUser,
	isAdminOrUser,
	isAccUsable,
} from '../middleware/authorization';
import { checkValidationRules } from './../utils/common';
import { reviewUUIDValidator, reviewValidator } from './../validators/reviews';
import { createReview } from './../controllers/reviews';
import { verifyAuthToken } from './../middleware/auth';
import { Error404 } from '../utils/404';

const router = Router({ mergeParams: true });

router.post(
	'/add',
	verifyAuthToken,
	isAccUsable,
	isAuthenticatedUser,
	reviewValidator,
	checkValidationRules,
	createReview
);

router.post(
	'/update/:id',
	verifyAuthToken,
	isAccUsable,
	isAuthenticatedUser,
	reviewValidator,
	checkValidationRules,
	createReview
);

router.post(
	'/delete/:id',
	verifyAuthToken,
	isAccUsable,
	isAdminOrUser,
	reviewUUIDValidator,
	checkValidationRules,
	createReview
);

router.use('*', Error404);

export default router;
