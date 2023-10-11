import { Router } from 'express';

import {
	propertyTypeQueryValidator,
	propertyTypeUUID,
	propertyTypeUpdateValidator,
	propertyTypeValidator,
} from '../validators/propertytype';
import { isAccUsable, isAdmin } from '../middleware/authorization';
import { verifyAuthToken } from '../middleware/auth';
import { checkValidationRules } from '../utils/common';
import { Error404 } from '../utils/404';
import {
	createPropertyType,
	getAllPropertyTypes,
	getSinglePropertyTypes,
	removePropertyType,
	updatePropertyType,
} from '../controllers/propertyType';

const router = Router();

// remove a property Type
router.delete(
	'/delete/:id',
	verifyAuthToken,
	isAccUsable,
	isAdmin,
	propertyTypeUUID,
	checkValidationRules,
	removePropertyType
);

// create a new property type
router.post(
	'/create',
	verifyAuthToken,
	isAccUsable,
	isAdmin,
	propertyTypeValidator,
	checkValidationRules,
	createPropertyType
);

// update propertyType Information
router.put(
	'/update/:id',
	verifyAuthToken,
	isAccUsable,
	isAdmin,
	propertyTypeUpdateValidator,
	checkValidationRules,
	updatePropertyType
);

// get all the properties
router.get(
	'/',
	propertyTypeQueryValidator,
	checkValidationRules,
	getAllPropertyTypes
);

// get single property type
router.get(
	'/:id/',
	propertyTypeUUID,
	checkValidationRules,
	getSinglePropertyTypes
);

// 404 endpoint
router.use('*', Error404);

export default router;
