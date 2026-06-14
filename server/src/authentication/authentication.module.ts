import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  controllers: [AuthenticationController],
  providers: [AuthenticationService, JwtAuthGuard],
  exports: [AuthenticationService, JwtAuthGuard],
})
export class AuthenticationModule {}
