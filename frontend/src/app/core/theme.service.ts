import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { DEFAULT_THEME, type ThemeConfig } from './theme.model';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<ThemeConfig>(structuredClone(DEFAULT_THEME));
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
