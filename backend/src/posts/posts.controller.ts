import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get('posts')
  findPublished() {
    return this.posts.findPublished();
  }

  @Get('posts/:slug')
  findOne(@Param('slug') slug: string) {
    return this.posts.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/posts')
  adminFindAll() {
    return this.posts.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/posts')
  create(@Body() body: Record<string, unknown>) {
    return this.posts.create(body as never);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/posts/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    const { id: _id, createdAt, updatedAt, ...data } = body;
    return this.posts.update(id, data as never);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/posts/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.posts.remove(id);
  }
}
