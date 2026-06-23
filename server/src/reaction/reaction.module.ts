import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { PadletAccessModule } from '../padlet-access/padlet-access.module';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';

@Module({
  imports: [AuthenticationModule, PadletAccessModule],
  controllers: [ReactionController],
  providers: [ReactionService],
})
export class ReactionModule {}
