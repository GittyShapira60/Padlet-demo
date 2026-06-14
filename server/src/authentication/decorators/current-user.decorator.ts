import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthUserDto } from '../authentication.service';
import type { AuthenticatedRequest } from '../jwt-auth.guard';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUserDto => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
