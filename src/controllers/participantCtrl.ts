'use strict';
import { Joi } from 'express-validation';
import { Response, Request } from 'express';
import { OK } from 'http-status';
import { Participant, roomIdSchema, userIdSchema } from '../models/participant';
import { pagination } from '../utils/restUtils';
import { In } from 'typeorm';
import { v4 } from 'uuid';
import { checkServerCapacity } from '../services/loadBalancer';
import { Room } from '../models/room';

export const getParticipantBulk = {
  validation: {
    query: Joi.object().keys({
      participantId: Joi.array()
        .items(userIdSchema)
        .single(),
      roomId: Joi.array()
        .items(roomIdSchema)
        .single(),
      userId: Joi.array()
        .items(userIdSchema)
        .single(),
      relations: Joi.array()
        .items(Joi.string().valid('room', 'user'))
        .single(),
      limit: pagination.schema.limit,
      offset: pagination.schema.offset,
    }),
  },
  handler: async (request: Request, response: Response): Promise<void> => {
    const participantIds = (request.query.participantId || []) as string[];
    const roomIds = (request.query.roomId || []) as string[];

    const userIds = (request.query.userId || []) as string[];
    const limit = Number(request.query.limit);
    const offset = Number(request.query.offset);
    const relations = (request.query.relations as string[]) || [];


    /* Where Clause */
    const where = Object.assign(
      {},
      participantIds.length > 0 && { participantId: In(participantIds) },
      roomIds.length > 0 && { roomId: In(roomIds) },
      userIds.length > 0 && { userId: In(userIds) },

    )

    // Check subscription exists
    const [participants, count] = await Participant.findAndCount({ where, relations, skip: offset, take: limit });

    response
      .status(OK)
      .set(pagination.addPaginationHeaders({}, count, limit, offset))
      .send(participants)
      .end();
  },
};

export const postParticipant = {
  validation: {
    body: Joi.object().keys({
      userId: userIdSchema.required(),
      roomId: roomIdSchema.required()
    }),
  },
  handler: async (request: Request, response: Response): Promise<void> => {
    // Extract parameters:
    const userId = request.body.userId;
    const roomId = request.body.roomId;

    const where = { roomId }
    const room = await Room.findOneOrFail({ where })
    checkServerCapacity((room).serverId)

    const participant = Participant.create({
      participantId: v4(),
      userId,
      roomId,
    })

    await participant.save();

    response.status(OK).send(participant).end();
  }
}

export const deleteParticipant = {
  validation: {
    params: Joi.object().keys({
      participantId: Joi.string().required(),
    }),
  },
  handler: async (request: Request, response: Response): Promise<void> => {
    // Extract parameters:
    const participantId = request.params.participantId;

    const where = { participantId }
    const participant = await Participant.findOneOrFail(
      { where }
    )

    await Participant.delete(where);

    response.status(OK).send(participant).end();
  }
}
