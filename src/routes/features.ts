import { Router } from 'express';

import { isAccUsable } from '../middleware/authorization';
import {
	featureUUidParamValidate,
	featureQueryValidator,
	featureUpdateValidator,
	featureValidator,
} from '../validators/features';
import { verifyAuthToken } from '../middleware/auth';
import { checkValidationRules } from '../utils/common';
import { isAdmin } from '../middleware/authorization';
import { Error404 } from '../utils/404';
import {
	getAllFeatures,
	createFeature,
	updateFeature,
	removeFeature,
	getFeature,
} from '../controllers/features';

// base router
const router = Router();

// all feature
router.get('/', featureQueryValidator, checkValidationRules, getAllFeatures);

router.get('/:id', featureUUidParamValidate, checkValidationRules, getFeature);

// add feature
router.post(
	'/create',
	verifyAuthToken,
	isAccUsable,
	isAdmin,
	featureValidator,
	checkValidationRules,
	createFeature
);

// update
router.put(
	'/update/:id',
	verifyAuthToken,
	isAccUsable,
	isAdmin,
	featureUpdateValidator,
	checkValidationRules,
	updateFeature
);

// delete user
router.delete(
	'/delete/:id',
	verifyAuthToken,
	isAccUsable,
	isAdmin,
	featureUUidParamValidate,
	checkValidationRules,
	removeFeature
);

// 404 endpoint
router.use('*', Error404);

export default router;
