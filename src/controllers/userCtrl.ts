'use strict';
import { Joi } from 'express-validation';
import { Response, Request } from 'express';
import { OK } from 'http-status';
import { displayNameSchema, User, userIdSchema } from '../models/user';
import { pagination } from '../utils/restUtils';
import { In } from 'typeorm';
import { v4 } from 'uuid';

export const getUserBulk = {
  validation: {
    query: Joi.object().keys({
      userId: Joi.array()
        .items(userIdSchema)
        .single(),
      displayName: Joi.array()
        .items(displayNameSchema)
        .single(),
      relations: Joi.array()
        .items(Joi.string().valid('participant'))
        .single(),
      limit: pagination.schema.limit,
      offset: pagination.schema.offset,
    }),
  },
  handler: async (request: Request, response: Response): Promise<void> => {
    const userIds = (request.query.userId || []) as string[];
    const displayNames = (request.query.displayName || []) as string[];
    const limit = Number(request.query.limit);
    const offset = Number(request.query.offset);
    const relations = (request.query.relations as string[]) || [];

    console.log(offset)
    /* Where Clause */
    const where = Object.assign(
      {},
      userIds.length > 0 && { userId: In(userIds) },
      displayNames.length > 0 && { displayName: In(displayNames) },
    )

    // Check subscription exists
    const [users, count] = await User.findAndCount({ where, relations, skip: offset, take: limit });

    response
      .status(OK)
      .set(pagination.addPaginationHeaders({}, count, limit, offset))
      .send(users)
      .end();
  },
};

export const postUser = {
  validation: {
    body: Joi.object().keys({
      displayName: displayNameSchema.required()
    }),
  },
  handler: async (request: Request, response: Response): Promise<void> => {
    // Extract parameters:
    const displayName = request.body.displayName;

    const user = User.create({
      userId: v4(),
      displayName,
    })

    await user.save();

    response.status(OK).send(user).end();
  }
}
