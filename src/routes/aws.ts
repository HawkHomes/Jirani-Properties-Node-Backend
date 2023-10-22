import { Router } from 'express';

import {
	deleteAwsObject,
	getAwsPresignedUrl,
} from '../controllers/awsSignature';
import { checkValidationRules } from '../utils/common';
import { Error404 } from '../utils/404';
import {
	signatureCountValidator,
	imgIdArrayValidator,
} from '../validators/signatureaws';

// base router
const router = Router();

router.get(
	`/get-signature`,
	signatureCountValidator,
	checkValidationRules,
	getAwsPresignedUrl
);

router.post(
	`/delete`,
	imgIdArrayValidator,
	checkValidationRules,
	deleteAwsObject
);

// 404 endpoint
router.use('*', Error404);

export default router;
