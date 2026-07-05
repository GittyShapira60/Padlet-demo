import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUserDto } from '../authentication/authentication.service';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { SwapPostsDto } from './dto/swap-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('padlets/:padletId/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a post on a padlet board' })
  createPost(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.createPost(user.id, user.username, padletId, dto);
  }

  @Patch(':postId')
  @ApiOperation({ summary: 'Update a post content on a padlet board' })
  updatePost(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
    @Param('postId') postId: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(user.id, padletId, postId, dto);
  }

  @Post('swap')
  @ApiOperation({ summary: 'Swap two post positions on a free-wall board' })
  swapPosts(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
    @Body() dto: SwapPostsDto,
  ) {
    return this.postsService.swapPostPositions(user.id, padletId, dto);
  }

  @Delete(':postId')
  @ApiOperation({ summary: 'Delete a post from a padlet board' })
  deletePost(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
    @Param('postId') postId: string,
  ) {
    return this.postsService.deletePost(user.id, padletId, postId);
  }

  @Delete(':postId/poll')
  @ApiOperation({ summary: 'Delete the poll attached to a post' })
  deletePoll(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
    @Param('postId') postId: string,
  ) {
    return this.postsService.deletePoll(user.id, padletId, postId);
  }

  @Post(':postId/vote')
  @ApiOperation({ summary: 'Vote on a poll option' })
  votePoll(
    @CurrentUser() user: AuthUserDto,
    @Param('padletId') padletId: string,
    @Param('postId') postId: string,
    @Body('option_id') optionId: string,
  ) {
    return this.postsService.votePoll(user.id, padletId, postId, optionId);
  }
}