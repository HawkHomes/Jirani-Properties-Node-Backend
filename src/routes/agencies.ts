import { Router } from 'express';

import { verifyAuthToken } from '../middleware/auth';
import { checkValidationRules } from '../utils/common';
import { uuidValidator } from '../validators/reusable';
import { Error404 } from '../utils/404';

import {
	AgencyQueryValidator,
	agencyUpdateValidator,
	agencyValidator,
} from '../validators/agency';

import {
	isAdminOrAdminAgent,
	isAccUsable,
	isAdmin,
} from '../middleware/authorization';

import {
	getAllAgencies,
	createAgency,
	deleteAgency,
	updateAgency,
	getAgency,
} from '../controllers/agency';

// base router
const router = Router();

// add agencies
router.post(
	'/create',
	verifyAuthToken,
	isAccUsable,
	isAdmin,
	agencyValidator,
	checkValidationRules,
	createAgency
);

// all agencies
router.get('/', AgencyQueryValidator, checkValidationRules, getAllAgencies);

// get single agencies
router.get(
	'/:id',
	uuidValidator({
		msg: 'invalid url param provided',
		queryString: false,
		targetField: 'id',
		optional: false,
	}),
	checkValidationRules,
	getAgency
);

// update agencies
router.put(
	'/update/:id',
	verifyAuthToken,
	isAccUsable,
	isAdminOrAdminAgent,
	agencyUpdateValidator,
	checkValidationRules,
	// check the param uuid
	uuidValidator({
		msg: 'invalid url param provided',
		queryString: false,
		targetField: 'id',
		optional: false,
	}),
	checkValidationRules,
	updateAgency
);

// delete agency
router.delete(
	'/delete/:id',
	verifyAuthToken,
	isAccUsable,
	isAdminOrAdminAgent,
	uuidValidator({
		msg: 'invalid url param provided',
		queryString: false,
		targetField: 'id',
		optional: false,
	}),
	checkValidationRules,
	deleteAgency
);

// 404 endpoint
router.use('*', Error404);

export default router;
