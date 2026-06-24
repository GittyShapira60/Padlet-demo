import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from './authentication/authentication.module';
import { HealthModule } from './health/health.module';
import { NotificationModule } from './notification/notification.module';
import { PadletsModule } from './padlets/padlets.module';
import { ParticipantsModule } from './participants/participants.module';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReactionModule } from './reaction/reaction.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    AuthenticationModule,
    NotificationModule,
    PadletsModule,
    ParticipantsModule,
    PostsModule,
    ReactionModule,
    UsersModule,
  ],
})
export class AppModule {}
