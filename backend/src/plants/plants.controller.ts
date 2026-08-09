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
import { PlantsService } from './plants.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class PlantsController {
  constructor(private readonly plants: PlantsService) {}

  @Get('plants')
  findAll() {
    return this.plants.findAll();
  }

  @Get('plants/:slug')
  findOne(@Param('slug') slug: string) {
    return this.plants.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/plants')
  adminFindAll() {
    return this.plants.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/plants')
  create(@Body() body: Record<string, unknown>) {
    return this.plants.create(body as never);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/plants/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    const { id: _id, createdAt, updatedAt, ...data } = body;
    return this.plants.update(id, data as never);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/plants/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.plants.remove(id);
  }
}
