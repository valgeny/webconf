'use strict';
import { Joi } from 'express-validation';
import { Response, Request } from 'express';
import { OK } from 'http-status';
import { encode_1, encode_2, hashEncode } from '../services/hashUtils';

export const postHash = {
  validation: {
    body: Joi.object().keys({
      input: Joi.string().required(),
      algo: Joi.string().valid('hash', 'homemade1', 'homemade2').required()
    }),
  },
  handler: async (request: Request, response: Response): Promise<void> => {
    const input = (request.body.input) as string;
    const algo = request.body.algo
    console.log(`Generating hash for ${input}...`)
    let hash
    switch (algo) {
      case 'hash':
        hash = hashEncode(input)
        break;
      case 'homemade1':
        hash = encode_1(input)
        break;
      case 'homemade2':
        hash = encode_2(input)
        break;
      default:
        hash = 'NA'
        break;
    }

    console.log(`${input} -> ${hash}`)

    response
      .status(OK)
      .send(hash)
      .end();
  },
};
