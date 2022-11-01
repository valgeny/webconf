import { Router } from 'express';
import { validate } from 'express-validation';
import asyncHandler from 'express-async-handler';
import { getUserBulk, postUser } from '../controllers/userCtrl';

const router: Router = Router();

router.get('/', validate(getUserBulk.validation, { context: true }), asyncHandler(getUserBulk.handler));

router.post('/', validate(postUser.validation, { context: true }), asyncHandler(postUser.handler));

export default router;
