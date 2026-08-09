import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Lang } from './models';

type Dict = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly dict = signal<Record<Lang, Dict> | null>(null);
  readonly lang = signal<Lang>(this.readStored());

  readonly ready = computed(() => this.dict() !== null);

  constructor(private readonly http: HttpClient) {
    this.http.get<Record<Lang, Dict>>('assets/i18n/translations.json').subscribe((data) => {
      this.dict.set(data);
    });
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
    localStorage.setItem('tj-lang', lang);
    document.documentElement.lang = lang;
  }

  t(path: string): string {
    const root = this.dict()?.[this.lang()];
    if (!root) return path;
    const value = path.split('.').reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object' && key in (acc as Dict)) {
        return (acc as Dict)[key];
      }
      return undefined;
    }, root);
    return typeof value === 'string' ? value : path;
  }

  list(path: string): Array<Record<string, string>> {
    const root = this.dict()?.[this.lang()];
    if (!root) return [];
    const value = path.split('.').reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object' && key in (acc as Dict)) {
        return (acc as Dict)[key];
      }
      return undefined;
    }, root);
    return Array.isArray(value) ? (value as Array<Record<string, string>>) : [];
  }

  plantField<T extends { nameEs: string; nameEn: string }>(
    plant: T,
    field: string
  ): string {
    const suffix = this.lang() === 'es' ? 'Es' : 'En';
    const key = `${field}${suffix}` as keyof T;
    const value = plant[key];
    return typeof value === 'string' ? value : '';
  }

  private readStored(): Lang {
    const stored = localStorage.getItem('tj-lang');
    return stored === 'en' ? 'en' : 'es';
  }
}
