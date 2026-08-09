import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PlantsModule } from './plants/plants.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PostsModule } from './posts/posts.module';
import { ThemeModule } from './theme/theme.module';
import { GalleryModule } from './gallery/gallery.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PlantsModule,
    AppointmentsModule,
    PostsModule,
    ThemeModule,
    GalleryModule,
  ],
})
export class AppModule {}
