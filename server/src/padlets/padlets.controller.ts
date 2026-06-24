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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUserDto } from '../authentication/authentication.service';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import {
  CopyPadletDto,
  CreatePadletDto,
  UpdatePadletDto,
} from './dto/create-padlet.dto';
import { GetPadletDetailQueryDto } from './dto/padlet-filter.dto';
import { PadletsService } from './padlets.service';

@ApiTags('padlets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('padlets')
export class PadletsController {
  constructor(private readonly padletsService: PadletsService) {}

  @Get()
  @ApiOperation({ summary: "Get the current user's boards (mine + shared)" })
  getBoards(@CurrentUser() user: AuthUserDto) {
    return this.padletsService.getBoards(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new padlet board' })
  createPadlet(@CurrentUser() user: AuthUserDto, @Body() dto: CreatePadletDto) {
    return this.padletsService.createPadlet(user.id, dto);
  }

  @Get(':padletId')
  @ApiOperation({ summary: 'Get a single padlet with its posts' })
  getPadletDetail(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
    @Query() query: GetPadletDetailQueryDto,
  ) {
    return this.padletsService.getPadletDetail(user.id, padletId, query);
  }

  @Patch(':padletId')
  @ApiOperation({ summary: 'Update a padlet board (owner only)' })
  updatePadlet(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
    @Body() dto: UpdatePadletDto,
  ) {
    return this.padletsService.updatePadlet(user.id, padletId, dto);
  }

  @Delete(':padletId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a padlet (owner only)' })
  deletePadlet(@CurrentUser() user: AuthUserDto, @Param('padletId') padletId: string) {
    return this.padletsService.deletePadlet(user.id, padletId);
  }

  @Post(':padletId/copy')
  @ApiOperation({ summary: 'Copy a padlet' })
  copyPadlet(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
    @Body() dto: CopyPadletDto,
  ) {
    return this.padletsService.copyPadlet(user.id, padletId, dto);
  }
}