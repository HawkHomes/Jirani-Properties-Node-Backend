import { Router } from 'express';

import { isAccUsable, isAdmin } from '../middleware/authorization';
import { verifyAuthToken } from '../middleware/auth';
import { checkValidationRules } from '../utils/common';
import { Error404 } from '../utils/404';

import {
	categoryQueryValidator,
	categoryUUIDParamValidator,
	categoryUpdateValidator,
	categoryValidator,
} from '../validators/category';
import {
	updateCategory,
	createCategory,
	removeCategory,
	getAllCategories,
	getCategory,
} from '../controllers/category';

// base router
const router = Router();

// all categories
router.get('/', categoryQueryValidator, checkValidationRules, getAllCategories);

// get single category

router.get(
	'/:id',
	categoryUUIDParamValidator,
	checkValidationRules,
	getCategory
);

// add category
router.post(
	'/create',
	verifyAuthToken,
	isAccUsable,
	isAdmin,
	categoryValidator,
	checkValidationRules,
	createCategory
);

// update
router.put(
	'/update/:id',
	verifyAuthToken,
	isAccUsable,
	isAdmin,
	categoryUpdateValidator,
	checkValidationRules,
	updateCategory
);

// delete user
router.delete(
	'/delete/:id',
	verifyAuthToken,
	isAccUsable,
	isAdmin,
	categoryUUIDParamValidator,
	checkValidationRules,
	removeCategory
);

// 404 endpoint
router.use('*', Error404);

export default router;
