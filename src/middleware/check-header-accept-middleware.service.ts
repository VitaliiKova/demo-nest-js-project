import {
  Injectable,
  NestMiddleware,
  NotAcceptableException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigKey } from '../config/config-key.enum';

@Injectable()
export class CheckHeaderAcceptMiddleware implements NestMiddleware {
  private readonly acceptAllowed = ConfigKey.ACCEPT_ALLOWED;

  use(req: Request, res: Response, next: NextFunction) {
    if (this.acceptAllowed !== req.headers['accept']?.toLowerCase()) {
      throw new NotAcceptableException({
        status: HttpStatus.NOT_ACCEPTABLE,
        message: `Unsupported 'Accept' header: ${req.headers.accept}. Must accept 'application/json'`,
      });
    }

    next();
  }
}
