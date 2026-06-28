import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUserDto } from '../authentication/authentication.service';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { UpdateVisitDurationDto } from './dto/update-visit-duration.dto';
import { StatsService } from './stats.service';

@ApiTags('stats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get statistics for the current user' })
  getStats(@CurrentUser() user: AuthUserDto) {
    return this.statsService.getStats(user.id);
  }

  @Post('padlets/:padletId/visit')
  @ApiOperation({ summary: 'Record a visit to a padlet' })
  recordVisit(@CurrentUser() user: AuthUserDto, @Param('padletId') padletId: string) {
    return this.statsService.recordVisit(padletId, user.id);
  }

  @Patch('visits/:visitId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update the duration of a visit' })
  updateVisitDuration(
    @CurrentUser() user: AuthUserDto,
    @Param('visitId') visitId: string,
    @Body() dto: UpdateVisitDurationDto,
  ) {
    return this.statsService.updateVisitDuration(visitId, user.id, dto.duration_sec);
  }

  @Get('padlets/:padletId/visits')
  @ApiOperation({ summary: 'Get daily visit breakdown for a specific padlet' })
  getPadletVisits(@CurrentUser() user: AuthUserDto, @Param('padletId') padletId: string) {
    return this.statsService.getPadletVisits(padletId, user.id);
  }
}
