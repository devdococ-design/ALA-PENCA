import { Component, OnInit, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n.service';
import { ApiService } from '../../core/api.service';
import type { GalleryItem } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  readonly gallery = signal<GalleryItem[]>([]);
  readonly lightboxItem = signal<GalleryItem | null>(null);

  constructor() {
    this.route.fragment.pipe(takeUntilDestroyed()).subscribe((fragment) => {
      this.scrollToFragment(fragment);
    });
  }

  ngOnInit(): void {
    this.api.getGallery().subscribe({
      next: (items) => this.gallery.set(items),
      error: () => this.gallery.set(this.fallbackGallery()),
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeLightbox();
  }

  t(path: string): string {
    return this.i18n.t(path);
  }

  faqs() {
    return this.i18n.list('faq.items');
  }

  packages() {
    return this.i18n.list('menu.packages');
  }

  private scrollToFragment(fragment: string | null): void {
    if (!fragment) return;

    const tryScroll = (attemptsLeft: number): void => {
      const el = document.getElementById(fragment);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (attemptsLeft > 0) {
        requestAnimationFrame(() => tryScroll(attemptsLeft - 1));
      }
    };

    setTimeout(() => tryScroll(40), 80);
  }

  mediaUrl(path: string): string {
    return this.api.mediaUrl(path);
  }

  galleryDescription(item: GalleryItem): string {
    return this.i18n.lang() === 'es' ? item.descriptionEs : item.descriptionEn;
  }

  openLightbox(item: GalleryItem): void {
    this.lightboxItem.set(item);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxItem.set(null);
    document.body.style.overflow = '';
  }

  scrollCarousel(track: HTMLElement, direction: -1 | 1): void {
    const amount = Math.max(track.clientWidth * 0.78, 240);
    track.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  private fallbackGallery(): GalleryItem[] {
    return [
      {
        id: 1,
        imageUrl: 'assets/brand/flyer-menu.png',
        descriptionEs: 'Menú ALA-PENCA — paquetes de pollo, costilla y chamorro.',
        descriptionEn: 'ALA-PENCA menu — chicken, ribs, and pork shank packages.',
        sortOrder: 0,
      },
      {
        id: 2,
        imageUrl: 'assets/brand/logo.png',
        descriptionEs: 'Logo ALA-PENCA.',
        descriptionEn: 'ALA-PENCA logo.',
        sortOrder: 1,
      },
    ];
  }
}
