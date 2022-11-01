import { Router } from 'express';
import { validate } from 'express-validation';
import asyncHandler from 'express-async-handler';
import { postHash } from '../controllers/hashCtrl';

const router: Router = Router();

router.post('/', validate(postHash.validation, { context: true }), asyncHandler(postHash.handler));

export default router;
