import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { I18nService } from '../../core/i18n.service';
import type { CartItem } from '../../core/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  readonly i18n = inject(I18nService);
  readonly cart = inject(CartService);

  t(path: string): string {
    return this.i18n.t(path);
  }

  name(item: CartItem): string {
    return this.i18n.lang() === 'es' ? item.nameEs : item.nameEn || item.nameEs;
  }

  money(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
  }

  lineTotal(item: CartItem): string {
    return this.money(item.price * item.quantity);
  }
}
