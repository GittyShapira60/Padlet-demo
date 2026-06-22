import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUserDto } from '../authentication/authentication.service';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { SetReactionDto } from './dto/set-reaction.dto';
import { ReactionService } from './reaction.service';

@ApiTags('reactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Get('padlets/:padletId/reactions')
  @ApiOperation({ summary: 'List reactions for all posts on a padlet board' })
  getPadletReactions(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
  ) {
    return this.reactionService.getPadletReactions(user.id, padletId);
  }

  @Get('padlets/:padletId/posts/:postId/reactions')
  @ApiOperation({ summary: 'Get reactions for a post' })
  getPostReactions(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
    @Param('postId') postId: string,
  ) {
    return this.reactionService.getPostReactions(user.id, padletId, postId);
  }

  @Put('padlets/:padletId/posts/:postId/reactions')
  @ApiOperation({ summary: 'Set or toggle the current user reaction on a post' })
  setPostReaction(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
    @Param('postId') postId: string,
    @Body() dto: SetReactionDto,
  ) {
    return this.reactionService.setPostReaction(
      user.id,
      padletId,
      postId,
      dto,
    );
  }

  @Delete('padlets/:padletId/posts/:postId/reactions')
  @ApiOperation({ summary: 'Remove the current user reaction from a post' })
  removePostReaction(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
    @Param('postId') postId: string,
  ) {
    return this.reactionService.removePostReaction(user.id, padletId, postId);
  }
}
