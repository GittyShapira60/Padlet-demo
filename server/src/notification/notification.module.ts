import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { RealtimeModule } from '../gateway/realtime.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [AuthenticationModule, RealtimeModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
