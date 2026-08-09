import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type ThemeConfig = {
  colors: Record<string, string>;
  fonts: {
    display: string;
    body: string;
    googleUrl: string;
  };
};

export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    '--paper': '#1f1f21',
    '--black': '#f4efe6',
    '--ink': '#ebe4d8',
    '--white': '#2a2a2e',
    '--muted': '#b9b2a6',
    '--muted-ink': '#6a6560',
    '--orange-500': '#f05a28',
    '--orange-600': '#d4451a',
    '--orange-400': '#ff7a4d',
    '--green-950': '#121314',
    '--green-900': '#1a1b1d',
    '--green-800': '#2a2c30',
    '--green-500': '#5fbf3a',
    '--green-300': '#8fd96a',
    '--green-100': '#d8f0c8',
  },
  fonts: {
    display: "'Oswald', 'Arial Narrow', sans-serif",
    body: "'Nunito Sans', system-ui, sans-serif",
    googleUrl:
      'https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400;6..12,500;6..12,600;6..12,700&family=Oswald:wght@500;600;700&display=swap',
  },
};

@Injectable()
export class ThemeService {
  constructor(private readonly prisma: PrismaService) {}

  async getTheme(): Promise<ThemeConfig> {
    const row = await this.prisma.siteSetting.findUnique({ where: { key: 'theme' } });
    if (!row) return DEFAULT_THEME;
    try {
      return { ...DEFAULT_THEME, ...JSON.parse(row.value) } as ThemeConfig;
    } catch {
      return DEFAULT_THEME;
    }
  }

  async saveTheme(theme: ThemeConfig): Promise<ThemeConfig> {
    const value = JSON.stringify(theme);
    await this.prisma.siteSetting.upsert({
      where: { key: 'theme' },
      create: { key: 'theme', value },
      update: { value },
    });
    return theme;
  }

  async resetTheme(): Promise<ThemeConfig> {
    return this.saveTheme(DEFAULT_THEME);
  }
}
