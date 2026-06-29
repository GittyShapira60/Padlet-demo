import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { RealtimeModule } from '../gateway/realtime.module';
import { NotificationModule } from '../notification/notification.module';
import { PadletAccessModule } from '../padlet-access/padlet-access.module';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';

@Module({
  imports: [AuthenticationModule, PadletAccessModule, NotificationModule, RealtimeModule],
  controllers: [ReactionController],
  providers: [ReactionService],
})
export class ReactionModule {}
