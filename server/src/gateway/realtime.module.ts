import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PadletAccessModule } from '../padlet-access/padlet-access.module';
import { RealtimeGateway } from './realtime.gateway';

@Module({
  imports: [ConfigModule, PadletAccessModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
