import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { I18nService } from '../../core/i18n.service';
import type { Lang } from '../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly i18n = inject(I18nService);
  readonly cart = inject(CartService);
  menuOpen = false;

  t(path: string): string {
    return this.i18n.t(path);
  }

  setLang(lang: Lang): void {
    this.i18n.setLang(lang);
  }

  toggle(): void {
    this.menuOpen = !this.menuOpen;
  }

  close(): void {
    this.menuOpen = false;
  }
}
