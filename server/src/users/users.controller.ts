import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { UserSummaryDto } from './dto/user-summary.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllUsers(): Promise<UserSummaryDto[]> {
    return this.usersService.getAllUsers();
  }
}
