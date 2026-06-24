import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';

@Module({
  imports: [AuthenticationModule],
  controllers: [ReactionController],
  providers: [ReactionService],
})
export class ReactionModule {}
