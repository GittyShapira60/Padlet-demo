import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PadletAccessService } from './padlet-access.service';

@Module({
  imports: [PrismaModule],
  providers: [PadletAccessService],
  exports: [PadletAccessService],
})
export class PadletAccessModule {}
