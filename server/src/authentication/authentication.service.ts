import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { sign, type SignOptions } from 'jsonwebtoken';
import { promisify } from 'util';
import { PrismaService } from '../prisma/prisma.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

const scryptAsync = promisify(scrypt);

export interface AuthUserDto {
  id: string;
  username: string;
}

export interface AuthResponseDto {
  token: string;
  user: AuthUserDto;
}

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: AuthCredentialsDto): Promise<AuthResponseDto> {
    const username = dto.username.trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('שם המשתמש כבר קיים');
    }

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        username,
        password_hash: passwordHash,
      },
    });

    return this.buildAuthResponse(user.id, user.username);
  }

  async login(dto: AuthCredentialsDto): Promise<AuthResponseDto> {
    const username = dto.username.trim();

    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('שם משתמש או סיסמה שגויים');
    }

    const isValidPassword = await this.verifyPassword(
      dto.password,
      user.password_hash,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('שם משתמש או סיסמה שגויים');
    }

    return this.buildAuthResponse(user.id, user.username);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  private async verifyPassword(
    password: string,
    storedHash: string,
  ): Promise<boolean> {
    const [salt, hash] = storedHash.split(':');

    if (!salt || !hash) {
      return false;
    }

    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    const storedKey = Buffer.from(hash, 'hex');

    if (derivedKey.length !== storedKey.length) {
      return false;
    }

    return timingSafeEqual(derivedKey, storedKey);
  }

  private buildAuthResponse(
    userId: string,
    username: string,
  ): AuthResponseDto {
    const secret = this.configService.get<string>('JWT_SECRET', 'dev-secret');
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d');
    const signOptions: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] };

    const token = sign({ sub: userId, username }, secret, signOptions);

    return {
      token,
      user: {
        id: userId,
        username,
      },
    };
  }
}
