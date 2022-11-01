import { BAD_REQUEST, CONFLICT, FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND, SERVICE_UNAVAILABLE, UNAUTHORIZED } from "http-status";
import type { NextFunction, Response } from 'express'
import { v4 } from 'uuid'


export class BaseError extends Error {
  errorId: string;
  errorText: string;
  originalError: Error | null;
  data: unknown | null;
  constructor(errorId: string, errorText: string, originalError: Error | null, data: unknown | null) {
    super();
    this.errorId = errorId;
    this.errorText = errorText;
    this.originalError = originalError;
    this.data = data;
  }

  toJson(loggingId: string | null, redactErrors: boolean = false): object {
    const oErr = this.originalError ? { name: this.originalError.name, desc: this.originalError.toString(), ex: this.originalError } : null;

    const errorObject = Object.assign(
      {
        errorId: this.errorId,
        errorText: this.errorText,
        loggingId: loggingId,
      },
      !redactErrors && { originalError: oErr },
      !redactErrors && { data: this.data }
    );

    // Handle circular references in object
    return JSON.parse(JSON.stringify(errorObject));
  }
}

export class HttpError extends BaseError {
  constructor(errorText: string, originalError: Error | null = null, data: unknown | null = null) {
    super('http-error', errorText || 'Http Error', originalError || null, data || null);
  }
}

export class ValidationError extends BaseError {
  constructor(errorText: string, originalError: Error | null = null, data: unknown | null = null) {
    super('validation-error', errorText || 'Validation Error', originalError || null, data || null);
  }
}

export class AuthError extends BaseError {
  constructor(errorText: string, originalError: Error | null = null, data: unknown | null = null) {
    super('auth-error', errorText || 'Authentication Error', originalError || null, data || null);
  }
}

export class ServiceError extends BaseError {
  constructor(errorText: string, originalError: Error | null = null, data: { req?: unknown; resp?: unknown; time?: unknown } | null = null) {
    super('service-error', errorText || 'Service Error', originalError || null, data || null);
  }
}


/*
 * Global Application Error Handler
 */
export const globalErrorHandler = (err: Error | BaseError, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof BaseError) {
    // Throw as it is
    next(err);
  } else if (err.name === 'ValidationError') {
    // Wrap the Joi validation errors
    next(new ValidationError('Bad formatting', err)); // Thrown by Joi
  } else if (err.name === 'SyntaxError') {
    // Wrap JSON parser errors
    next(new ValidationError('Invalid JSON formatting', err)); // Thrown by JSON parser
  } else if (err instanceof URIError) {
    // ??? TODO: Find if usefull
    next(new ValidationError('Invalid url', err));
  } else {
    // Wrap any unexpected error into 500
    next(new BaseError('undefined-error', 'Server has encountered an Error', err, null));
  }
};

export class NotFoundError extends BaseError {
  constructor(errorText: string | null = null, originalError: Error | null = null, data: unknown | null = null) {
    super('not-found-error', errorText || 'Entity not found', originalError || null, data || null);
  }
}

export class EntityError extends BaseError {
  constructor(errorText: string | null = null, originalError: Error | null = null, data: unknown | null = null) {
    super('no-entity-error', errorText || 'Entity error', originalError || null, data || null);
  }
}

export const httpErrorTransformer = (err: BaseError, _req: Request, res: Response, next: NextFunction): void => {
  if (res.headersSent) {
    console.warn('Streaming is not supported');
    return next(err);
  }

  // Map to Error Code
  let errorCode: number;
  if (err instanceof ValidationError) {
    errorCode = BAD_REQUEST; // 400
  } else if (err instanceof HttpError) {
    errorCode = NOT_FOUND; // 404
  } else if (err instanceof AuthError) {
    errorCode = UNAUTHORIZED; // 401
  } else if (err instanceof EntityError) {
    errorCode = FORBIDDEN; // 403
  } else if (err instanceof NotFoundError) {
    errorCode = NOT_FOUND; // 404
  } else if (err instanceof ServiceError) {
    errorCode = SERVICE_UNAVAILABLE; // 503
  } else {
    errorCode = INTERNAL_SERVER_ERROR; // 500
  }

  // Logs
  if (errorCode >= INTERNAL_SERVER_ERROR) {
    // Record 5xx as Errors
    console.error(err.toJson(v4(), false));
  } else if (errorCode === NOT_FOUND) {
    // Skip
  } else if (errorCode >= BAD_REQUEST) {
    // Record 4xx as Warnings
    console.warn(err.toJson(v4(), false));
  }


  // Send Response
  res.status(errorCode).send(err.toJson(v4(), false));
};