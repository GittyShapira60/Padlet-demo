import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
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

  @Get('most-visited')
  @ApiOperation({ summary: 'Get most visited padlets filtered by date range' })
  getMostVisitedPadlets(
    @CurrentUser() user: AuthUserDto,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const today = new Date();

    const fromDate = from ? new Date(from) : fourteenDaysAgo;
    const toDate = to ? new Date(to) : today;

    const clampedFrom = fromDate < fourteenDaysAgo ? fourteenDaysAgo : fromDate;
    const clampedTo = toDate > today ? today : toDate;

    // toDate should be end of day so visits throughout that day are included
    clampedTo.setHours(23, 59, 59, 999);

    return this.statsService.getMostVisitedPadlets(user.id, clampedFrom, clampedTo);
  }
}
