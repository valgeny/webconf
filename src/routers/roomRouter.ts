import { Router } from 'express';
import { validate } from 'express-validation';
import asyncHandler from 'express-async-handler';
import { getRoomBulk, postRoom } from '../controllers/roomCtrl';

const router: Router = Router();

router.get('/', validate(getRoomBulk.validation, {context: true}), asyncHandler(getRoomBulk.handler));

router.post(
  '/', validate(postRoom.validation, {context: true}), asyncHandler(postRoom.handler));

export default router;
