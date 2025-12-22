import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JwtContent } from '../types/jwt-content';

export const IdFromJWT = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const payload: JwtContent = request['payload'];
    return payload.id;
  },
);
