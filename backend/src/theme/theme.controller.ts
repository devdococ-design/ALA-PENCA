import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThemeService, type ThemeConfig } from './theme.service';

@Controller()
export class ThemeController {
  constructor(private readonly theme: ThemeService) {}

  @Get('theme')
  getTheme() {
    return this.theme.getTheme();
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/theme')
  saveTheme(@Body() body: ThemeConfig) {
    return this.theme.saveTheme(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/theme/reset')
  resetTheme() {
    return this.theme.resetTheme();
  }
}
