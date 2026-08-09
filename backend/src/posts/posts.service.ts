import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublished() {
    return this.prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll() {
    return this.prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, published: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  create(data: Prisma.BlogPostCreateInput) {
    return this.prisma.blogPost.create({ data });
  }

  update(id: number, data: Prisma.BlogPostUpdateInput) {
    return this.prisma.blogPost.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.blogPost.delete({ where: { id } });
  }
}
