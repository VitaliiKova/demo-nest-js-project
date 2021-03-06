import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception.isAxiosError) {
      status = exception.response.status;
      message = 'GitHub Error: ' + exception.response.statusText;
    } else if (exception instanceof Error) {
      status = 400;
      message = exception.message;
    }

    response.status(status).json({
      status: status,
      message: message,
    });
  }
}
