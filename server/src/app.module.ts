import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from './authentication/authentication.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    AuthenticationModule,
  ],
})
export class AppModule {}
