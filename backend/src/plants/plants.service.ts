import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlantsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.plant.findMany({ orderBy: { nameEs: 'asc' } });
  }

  async findBySlug(slug: string) {
    const plant = await this.prisma.plant.findUnique({ where: { slug } });
    if (!plant) throw new NotFoundException('Plant not found');
    return plant;
  }

  create(data: Prisma.PlantCreateInput) {
    return this.prisma.plant.create({ data });
  }

  update(id: number, data: Prisma.PlantUpdateInput) {
    return this.prisma.plant.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.plant.delete({ where: { id } });
  }
}
