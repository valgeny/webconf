'use strict';

import { Request } from 'express';
import type joi from 'joi';
import { Joi } from 'express-validation';


export const PAGINATION_DEFAULT = { limit: 20, offset: 0 };
export const PAGINATION_BOUNDARIES = { limitMin: 1, limitMax: 500 };
export const URLPARAM_BOUNDARIES = { limitMin: 1, limitMax: 25 }; // Max number of items in a URL
export const BODYPARAM_BOUNDARIES = { limitMin: 0, limitMax: 1000 };
/**
 * @swagger
 * components:
 *   parameters:
 *     PaginationLimit:
 *       name: limit
 *       in: query
 *       description: Pagination Limit
 *       required: false
 *       schema:
 *         type: integer
 *         example: 20
 *         default: 20
 *         minimum: 1
 *         maximum: 100
 *     PaginationOffset:
 *       name: offset
 *       in: query
 *       description: Pagination Offset
 *       required: false
 *       schema:
 *         type: integer
 *         format: integer
 *         example: 0
 *         default: 0
 *         minimum: 0
 */
export const pagination = {
  schema: {
    limit: Joi.number().integer().min(PAGINATION_BOUNDARIES.limitMin).max(PAGINATION_BOUNDARIES.limitMax).default(PAGINATION_DEFAULT.limit),
    offset: Joi.number().integer().positive().allow(0).default(PAGINATION_DEFAULT.offset),
  },
  formatLinkHeader: (count: number, limit: number, offset: number): Record<string, string> => {
    return {
      self: `?limit=${limit}&?offset=${offset}`,
      next: `?limit=${limit}&?offset=${offset + limit}`,
      last: `?limit=${limit}&?offset=${Math.floor(count / limit) * limit}`,
    };
  },
  addPaginationHeaders: (headers: Record<string, unknown>, count: number, limit: number, offset: number): Record<string, unknown> => {
    return Object.assign(headers, {
      link: JSON.stringify(pagination.formatLinkHeader(count, limit, offset)),
      'X-total-count': count,
    });
  },
};

export const mutation = {
  addHeaders: (headers: Record<string, unknown>, count: number): Record<string, unknown> => {
    return Object.assign(headers, {
      'X-total-count': count,
    });
  },
};

/**
 * Joi Validation extension to handle String arrays
 */
export const customJoi = Joi.extend((joi) => ({
  type: 'stringArray',
  base: joi.array(),
  coerce: (value: string, _helpers: joi.CustomHelpers): joi.CoerceResult => {
    const cids = value.split(',').map((x) => x.trim());
    return { value: cids };
  },
}));

export const dateRange = {
  validate: (strField: string): Record<string, unknown> => {
    return {
      [strField]: Joi.date().max('now'),
      [`${strField}.start`]: Joi.date().max('now').when(Joi.ref(strField), {
        is: Joi.exist(),
        then: Joi.forbidden(),
        otherwise: Joi.optional(),
      }),
      [`${strField}.end`]: Joi.date().max('now').when(Joi.ref(strField), {
        is: Joi.exist(),
        then: Joi.forbidden(),
        otherwise: Joi.optional(),
      }),
    };
  },
  extract: (request: Request, strField: string): { start: string | undefined; end: string | undefined } => {
    return {
      start: (request.query[strField] as string) || (request.query[`${strField}.start`] as string) || undefined,
      end: (request.query[`${strField}.end`] as string) || undefined,
    };
  },
};

export const sort = {
  validate: (strFields: string[] & { 0: string }, defaultField: string = null, defaultOrder: 'ASC' | 'DESC' = 'DESC'): Record<string, unknown> => {
    return {
      sortField: Joi.string()
        .valid(...strFields)
        .default(defaultField || (strFields.length && strFields[0])),
      sortOrder: Joi.string().valid('ASC', 'DESC').default(defaultOrder),
    };
  },
  extract: (request: Request): Record<string, string> => {
    return { [request.query.sortField as string]: request.query.sortOrder as string };
  },
};

module.exports = {
  pagination,
  mutation,
  dateRange,
  sort,
};
