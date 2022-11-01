'use strict';
import { Joi } from 'express-validation';
import { Response, Request } from 'express';
import { OK } from 'http-status';
import { MAX_SERVER_NUMBER, Room, roomIdSchema, serverIdSchema, userIdSchema } from '../models/room';
import { pagination } from '../utils/restUtils';
import { In } from 'typeorm';
import { v4 } from 'uuid';
import { allocateServer, checkServerCapacity, findLeastUsedServer } from '../services/loadBalancer';

export const getRoomBulk = {
  validation: {
    query: Joi.object().keys({
      roomId: Joi.array()
        .items(roomIdSchema)
        .single(),
      serverId: Joi.array()
        .items(serverIdSchema)
        .single(),
      hostId: Joi.array()
        .items(userIdSchema)
        .single(),
      relations: Joi.array()
        .items(Joi.string().valid('participants'))
        .single(),
      limit: pagination.schema.limit,
      offset: pagination.schema.offset,
    }),
  },
  handler: async (request: Request, response: Response): Promise<void> => {
    const roomIds = (request.query.roomId || []) as string[];
    const serverIds = (request.query.serverId || []) as string[];
    const hostIds = (request.query.hostId || []) as string[];
    const limit = Number(request.query.limit);
    const offset = Number(request.query.offset);
    const relations = (request.query.relations as string[]) || [];

    console.log(offset)
    /* Where Clause */
    const where = Object.assign(
      {},
      roomIds.length > 0 && { roomId: In(roomIds) },
      serverIds.length > 0 && { serverId: In(serverIds) },
      hostIds.length > 0 && { hostId: In(hostIds) },
    )

    // Check subscription exists
    const [rooms, count] = await Room.findAndCount({ where, relations, skip: offset, take: limit });

    response
      .status(OK)
      .set(pagination.addPaginationHeaders({}, count, limit, offset))
      .send(rooms)
      .end();
  },
};

export const postRoom = {
  validation: {
    body: Joi.object().keys({
      hostId: userIdSchema.required()
    }),
  },
  handler: async (request: Request, response: Response): Promise<void> => {
    // Extract parameters:
    const hostId = request.body.hostId;
    let serverId: number
    try {
      serverId = allocateServer(v4(), MAX_SERVER_NUMBER);
      checkServerCapacity(serverId)
    }
    catch {
      serverId = await findLeastUsedServer()
    }

    const room = Room.create({
      roomId: v4(),
      hostId,
      serverId,
    })

    await room.save();

    response.status(OK).send(room).end();
  }
}
