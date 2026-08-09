import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { GalleryService } from './gallery.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const uploadDir = join(process.cwd(), 'uploads', 'gallery');

@Controller()
export class GalleryController {
  constructor(private readonly gallery: GalleryService) {}

  @Get('gallery')
  findAll() {
    return this.gallery.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/gallery')
  adminFindAll() {
    return this.gallery.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/gallery')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/)) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body()
    body: {
      imageUrl?: string;
      descriptionEs?: string;
      descriptionEn?: string;
      sortOrder?: string;
    },
  ) {
    const imageUrl = file
      ? `/uploads/gallery/${file.filename}`
      : (body.imageUrl ?? '');
    return this.gallery.create({
      imageUrl,
      descriptionEs: body.descriptionEs,
      descriptionEn: body.descriptionEn,
      sortOrder: body.sortOrder ? Number(body.sortOrder) : 0,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/gallery/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/)) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body()
    body: {
      imageUrl?: string;
      descriptionEs?: string;
      descriptionEn?: string;
      sortOrder?: string;
    },
  ) {
    const data: {
      imageUrl?: string;
      descriptionEs?: string;
      descriptionEn?: string;
      sortOrder?: number;
    } = {
      descriptionEs: body.descriptionEs,
      descriptionEn: body.descriptionEn,
    };
    if (file) data.imageUrl = `/uploads/gallery/${file.filename}`;
    else if (body.imageUrl) data.imageUrl = body.imageUrl;
    if (body.sortOrder !== undefined && body.sortOrder !== '') {
      data.sortOrder = Number(body.sortOrder);
    }
    return this.gallery.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/gallery/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gallery.remove(id);
  }
}
