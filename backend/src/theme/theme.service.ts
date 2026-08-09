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
    '--paper': '#84816b',
    '--black': '#1c1d19',
    '--ink': '#1c1d19',
    '--white': '#f2eee4',
    '--muted': '#efebe0',
    '--muted-ink': '#5a5b52',
    '--orange-500': '#d4783a',
    '--orange-600': '#b85f28',
    '--orange-400': '#e4a06a',
    '--green-950': '#1e2218',
    '--green-900': '#2a3024',
    '--green-800': '#3d4633',
    '--green-500': '#b3bf86',
    '--green-300': '#d5d9c0',
    '--green-100': '#ece9df',
  },
  fonts: {
    display: "'Fraunces', Georgia, serif",
    body: "'Manrope', system-ui, sans-serif",
    googleUrl:
      'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap',
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
