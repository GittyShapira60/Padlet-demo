import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [AuthenticationModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
