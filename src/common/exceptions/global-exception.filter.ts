import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const res = exception.getResponse();

    if (typeof res === 'object' && res !== null && 'message' in res) {
      return response.status(status).json(res);
    }

    response.status(status).json({
      statusCode: status,
      message: typeof res === 'string' ? res : 'Bad Request',
      timestamp: new Date().toISOString(),
    });
  }
}
