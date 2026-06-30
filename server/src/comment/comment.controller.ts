import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUserDto } from '../authentication/authentication.service';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('padlets/:padletId/posts/:postId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @ApiOperation({ summary: 'List comments for a post' })
  listComments(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
    @Param('postId') postId: string,
  ) {
    return this.commentService.listComments(user.id, padletId, postId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a comment on a post' })
  createComment(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentService.createComment(
      user.id,
      user.username,
      padletId,
      postId,
      dto,
    );
  }

  @Patch(':commentId')
  @ApiOperation({ summary: 'Update a comment on a post' })
  updateComment(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentService.updateComment(
      user.id,
      padletId,
      postId,
      commentId,
      dto,
    );
  }

  @Delete(':commentId')
  @ApiOperation({ summary: 'Delete a comment from a post' })
  deleteComment(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.commentService.deleteComment(
      user.id,
      padletId,
      postId,
      commentId,
    );
  }
}
