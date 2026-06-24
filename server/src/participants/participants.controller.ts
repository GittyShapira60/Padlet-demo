import {
  Body,
  Controller,
  Delete,
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
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantPermissionDto } from './dto/update-participant-permission.dto';
import { ParticipantsService } from './participants.service';

@ApiTags('participants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('padlets/:padletId/participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Get()
  @ApiOperation({ summary: 'List participants for a padlet board' })
  getParticipants(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
  ) {
    return this.participantsService.getParticipants(user.id, padletId);
  }

  @Post()
  @ApiOperation({ summary: 'Invite a participant to a padlet board' })
  inviteParticipant(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
    @Body() dto: CreateParticipantDto,
  ) {
    return this.participantsService.inviteParticipant(user.id, padletId, dto);
  }

  @Patch(':participantUserId')
  @ApiOperation({ summary: 'Update a participant permission on a padlet board' })
  updateParticipantPermission(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
    @Param('participantUserId') participantUserId: string,
    @Body() dto: UpdateParticipantPermissionDto,
  ) {
    return this.participantsService.updateParticipantPermission(
      user.id,
      padletId,
      participantUserId,
      dto,
    );
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Leave a shared padlet board as the current user' })
  leaveCurrentPadlet(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
  ) {
    return this.participantsService.leavePadlet(user.id, padletId);
  }
}
