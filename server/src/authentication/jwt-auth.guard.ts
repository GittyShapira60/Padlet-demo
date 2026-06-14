import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { verify, type JwtPayload } from 'jsonwebtoken';
import type { AuthUserDto } from './authentication.service';

export interface AuthenticatedRequest extends Request {
  user: AuthUserDto;
}

interface AccessTokenPayload extends JwtPayload {
  sub: string;
  username: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('חסר טוקן הזדהות');
    }

    const payload = this.verifyToken(token);

    request.user = {
      id: payload.sub,
      username: payload.username,
    };

    return true;
  }

  private extractBearerToken(request: Request): string | null {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }

  private verifyToken(token: string): AccessTokenPayload {
    const secret = this.configService.get<string>('JWT_SECRET', 'dev-secret');

    try {
      return verify(token, secret) as AccessTokenPayload;
    } catch {
      throw new UnauthorizedException('טוקן לא תקין או שפג תוקפו');
    }
  }
}
