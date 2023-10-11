import { Router } from 'express';

import { isAdminOrIsLandowner, isAccUsable } from '../middleware/authorization';
import { verifyAuthToken } from './../middleware/auth';
import { checkValidationRules } from './../utils/common';
import reviewController from './reviews';
import houseController from './houses';
import { Error404 } from '../utils/404';
import {
	propertyQueryValidator,
	propertyUUidValidator,
	propertyUpdateValidator,
	propertyValidator,
} from './../validators/property';

import {
	getSingleProperty,
	getAllProperties,
	createProperty,
	removeProperty,
	updateProperty,
} from '../controllers/property';

const router = Router({ mergeParams: true });

// get all properties
router.get('/', propertyQueryValidator, checkValidationRules, getAllProperties);

// get single property
router.get('/:pid/', getSingleProperty);

// create property
router.post(
	'/create',
	verifyAuthToken,
	isAccUsable,
	isAdminOrIsLandowner,
	propertyValidator,
	checkValidationRules,
	// verifySignature,
	createProperty
);

// update property
router.put(
	'/update/:pid',
	verifyAuthToken,
	isAccUsable,
	isAdminOrIsLandowner,
	propertyUpdateValidator,
	checkValidationRules,
	updateProperty
);

// delete property
router.delete(
	'/delete/:pid',
	verifyAuthToken,
	isAccUsable,
	isAdminOrIsLandowner,
	...propertyUUidValidator,
	checkValidationRules,
	removeProperty
);

// houses
router.use(
	`/:pid/houses`,
	...propertyUUidValidator,
	checkValidationRules,
	houseController
);

//reviews
router.use(
	'/:pid/reviews',
	...propertyUUidValidator,
	checkValidationRules,
	reviewController
);

router.use('*', Error404);

export default router;
