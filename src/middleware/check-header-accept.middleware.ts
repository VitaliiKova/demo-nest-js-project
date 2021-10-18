import {
  Injectable,
  NestMiddleware,
  NotAcceptableException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class checkHeaderAcceptMiddleware implements NestMiddleware {
  private readonly acceptAllowed = process.env.ACCEPT_ALLOWED;

  use(req: Request, res: Response, next: NextFunction) {
    if (!this.acceptAllowed.includes(req.headers['accept'])) {
      throw new NotAcceptableException({
        status: HttpStatus.NOT_ACCEPTABLE,
        message: 'Not Acceptable',
      });
    }

    next();
  }
}
