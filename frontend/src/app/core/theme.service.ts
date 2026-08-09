import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  DEFAULT_THEME,
  FONT_PAIRS,
  type ThemeConfig,
  type ThemeColors,
} from './theme.model';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<ThemeConfig>(structuredClone(DEFAULT_THEME));
  readonly fontPairs = FONT_PAIRS;
  private fontLinkEl: HTMLLinkElement | null = null;

  constructor(private readonly http: HttpClient) {}

  async init(): Promise<void> {
    try {
      const remote = await firstValueFrom(
        this.http.get<ThemeConfig>(`${environment.apiUrl}/theme`)
      );
      const merged = this.mergeTheme(remote);
      this.theme.set(merged);
      this.apply(merged);
    } catch {
      const cached = localStorage.getItem('ala-theme');
      if (cached) {
        try {
          const parsed = this.mergeTheme(JSON.parse(cached) as ThemeConfig);
          this.theme.set(parsed);
          this.apply(parsed);
          return;
        } catch {
          /* fall through */
        }
      }
      this.apply(DEFAULT_THEME);
    }
  }

  preview(partial: ThemeConfig): void {
    this.apply(partial);
  }

  setColor(key: keyof ThemeColors, value: string): void {
    const next = structuredClone(this.theme());
    next.colors[key] = value;
    if (key === '--black') next.colors['--ink'] = value;
    this.theme.set(next);
    this.apply(next);
  }

  setFontPair(pairId: string): void {
    const pair = FONT_PAIRS.find((p) => p.id === pairId);
    if (!pair) return;
    const next = structuredClone(this.theme());
    next.fonts = {
      display: pair.display,
      body: pair.body,
      googleUrl: pair.googleUrl,
    };
    this.theme.set(next);
    this.apply(next);
  }

  activeFontPairId(): string {
    const current = this.theme().fonts;
    const match = FONT_PAIRS.find(
      (p) => p.display === current.display && p.body === current.body
    );
    return match?.id ?? FONT_PAIRS[0].id;
  }

  async save(token: string): Promise<void> {
    const current = this.theme();
    await firstValueFrom(
      this.http.put<ThemeConfig>(`${environment.apiUrl}/admin/theme`, current, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    localStorage.setItem('ala-theme', JSON.stringify(current));
  }

  async reset(token: string): Promise<void> {
    const reset = await firstValueFrom(
      this.http.put<ThemeConfig>(`${environment.apiUrl}/admin/theme/reset`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    const merged = this.mergeTheme(reset);
    this.theme.set(merged);
    this.apply(merged);
    localStorage.setItem('ala-theme', JSON.stringify(merged));
  }

  private apply(theme: ThemeConfig): void {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    root.style.setProperty('--font-display', theme.fonts.display);
    root.style.setProperty('--font-body', theme.fonts.body);
    this.loadGoogleFont(theme.fonts.googleUrl);
    localStorage.setItem('ala-theme', JSON.stringify(theme));
  }

  private loadGoogleFont(url: string): void {
    if (!this.fontLinkEl) {
      this.fontLinkEl = document.createElement('link');
      this.fontLinkEl.rel = 'stylesheet';
      this.fontLinkEl.id = 'ala-theme-fonts';
      document.head.appendChild(this.fontLinkEl);
    }
    if (this.fontLinkEl.href !== url) {
      this.fontLinkEl.href = url;
    }
  }

  private mergeTheme(incoming: Partial<ThemeConfig> | null | undefined): ThemeConfig {
    return {
      colors: { ...DEFAULT_THEME.colors, ...(incoming?.colors ?? {}) },
      fonts: { ...DEFAULT_THEME.fonts, ...(incoming?.fonts ?? {}) },
    };
  }
}
