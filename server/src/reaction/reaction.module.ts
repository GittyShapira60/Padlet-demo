import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { NotificationModule } from '../notification/notification.module';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';

@Module({
  imports: [AuthenticationModule, NotificationModule],
  controllers: [ReactionController],
  providers: [ReactionService],
})
export class ReactionModule {}
