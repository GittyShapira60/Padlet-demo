import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserSummaryDto } from './dto/user-summary.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(): Promise<UserSummaryDto[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
      },
      orderBy: {
        username: 'asc',
      },
    });

    return users.map((user) => ({
      id: user.id.toString(),
      username: user.username,
    }));
  }
}
