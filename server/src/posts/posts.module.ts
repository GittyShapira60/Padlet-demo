import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { RealtimeModule } from '../gateway/realtime.module';
import { NotificationModule } from '../notification/notification.module';
import { PadletAccessModule } from '../padlet-access/padlet-access.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [AuthenticationModule, PadletAccessModule, NotificationModule, RealtimeModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
