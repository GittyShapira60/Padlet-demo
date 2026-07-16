import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from './authentication/authentication.module';
import { CommentModule } from './comment/comment.module';
import { HealthModule } from './health/health.module';
import { NotificationModule } from './notification/notification.module';
import { PadletAccessModule } from './padlet-access/padlet-access.module';
import { PadletsModule } from './padlets/padlets.module';
import { ParticipantsModule } from './participants/participants.module';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReactionModule } from './reaction/reaction.module';
import { StatsModule } from './stats/stats.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    StorageModule,
    HealthModule,
    AuthenticationModule,
    CommentModule,
    PadletAccessModule,
    NotificationModule,
    PadletsModule,
    ParticipantsModule,
    PostsModule,
    ReactionModule,
    StatsModule,
    UsersModule,
  ],
})
export class AppModule {}
