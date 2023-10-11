import { Router } from 'express';

import { requestPayment } from './../controllers/payments';
import { getMpesaOAuth } from './../middleware/payment';

const router = Router({ mergeParams: true });

router.post('/request', getMpesaOAuth, requestPayment);

export default router;
