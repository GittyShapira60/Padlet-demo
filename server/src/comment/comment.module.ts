import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { NotificationModule } from '../notification/notification.module';
import { PadletAccessModule } from '../padlet-access/padlet-access.module';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [AuthenticationModule, NotificationModule, PadletAccessModule],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
