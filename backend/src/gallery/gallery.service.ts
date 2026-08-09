import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GalleryService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.galleryItem.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] });
  }

  create(data: {
    imageUrl: string;
    descriptionEs?: string;
    descriptionEn?: string;
    sortOrder?: number;
  }) {
    return this.prisma.galleryItem.create({
      data: {
        imageUrl: data.imageUrl,
        descriptionEs: data.descriptionEs ?? '',
        descriptionEn: data.descriptionEn ?? '',
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async update(
    id: number,
    data: {
      imageUrl?: string;
      descriptionEs?: string;
      descriptionEn?: string;
      sortOrder?: number;
    },
  ) {
    try {
      return await this.prisma.galleryItem.update({ where: { id }, data });
    } catch {
      throw new NotFoundException('Gallery item not found');
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.galleryItem.delete({ where: { id } });
      return { ok: true };
    } catch {
      throw new NotFoundException('Gallery item not found');
    }
  }
}
