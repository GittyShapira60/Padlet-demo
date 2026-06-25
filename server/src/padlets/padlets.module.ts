import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { PadletAccessModule } from '../padlet-access/padlet-access.module';
import { PostsModule } from '../posts/posts.module';
import { PadletsController } from './padlets.controller';
import { PadletsService } from './padlets.service';

@Module({
  imports: [AuthenticationModule, PadletAccessModule, PostsModule],
  controllers: [PadletsController],
  providers: [PadletsService],
})
export class PadletsModule {}
