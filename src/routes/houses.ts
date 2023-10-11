import { Router } from 'express';

import { isAdminOrIsLandowner, isAccUsable } from '../middleware/authorization';
import { verifyAuthToken } from '../middleware/auth';
import { checkValidationRules } from '../utils/common';
import {
	HouseValidator,
	houseQueryValidator,
	houseUUIDValidator,
	houseUpdateValidator,
} from '../validators/house';
import { Error404 } from '../utils/404';

import {
	getAllPropertyHouses,
	getSingleSingleHouse,
	removeHouse,
	createHouse,
	updateHouse,
} from '../controllers/house';

const router = Router({ mergeParams: true });

// get all property houses
router.get(
	'/',
	houseQueryValidator,
	checkValidationRules,
	getAllPropertyHouses
);

// get single houses
router.get(
	'/:hid/',
	houseUUIDValidator,
	checkValidationRules,
	getSingleSingleHouse
);

// create houses
router.post(
	'/create',
	verifyAuthToken,
	isAccUsable,
	isAdminOrIsLandowner,
	HouseValidator,
	checkValidationRules,
	createHouse
);

// update houses
router.put(
	'/update/:hid',
	verifyAuthToken,
	isAccUsable,
	isAdminOrIsLandowner,
	houseUpdateValidator,
	checkValidationRules,
	updateHouse
);

// delete houses
router.delete(
	'/delete/:hid',
	verifyAuthToken,
	isAccUsable,
	isAdminOrIsLandowner,
	houseUUIDValidator,
	checkValidationRules,
	removeHouse
);

router.use('*', Error404);

export default router;
