import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import debug from 'debug';
import { Request } from 'express';

const logException = debug('debug:exception');

@Injectable()
// Inspired from https://docs.nestjs.com/security/authentication#implementing-the-authentication-guard
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException();
      }
      const payload = this.jwtService.verify(token);
      // Payload is attached to the request object. So we can access it in the controllers.
      request['payload'] = payload;
      return true;
    } catch (e) {
      logException('%s', e.stack || e.message);
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];

    return type === 'Bearer' ? token : null;
  }
}
