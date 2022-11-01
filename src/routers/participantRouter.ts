import { Router } from 'express';
import { validate } from 'express-validation';
import asyncHandler from 'express-async-handler';
import { deleteParticipant, getParticipantBulk, postParticipant } from '../controllers/participantCtrl';

const router: Router = Router();

router.get('/', validate(getParticipantBulk.validation, { context: true }), asyncHandler(getParticipantBulk.handler));

router.post(
  '/', validate(postParticipant.validation, { context: true }), asyncHandler(postParticipant.handler));

router.delete(
  '/:participantId', validate(deleteParticipant.validation, { context: true }), asyncHandler(deleteParticipant.handler));


export default router;
