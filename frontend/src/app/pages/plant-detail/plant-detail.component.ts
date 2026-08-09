import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { CartService } from '../../core/cart.service';
import { I18nService } from '../../core/i18n.service';
import { normalizeHumidity, normalizeLight, normalizeWater } from '../../core/plant-care';
import type { Plant } from '../../core/models';

@Component({
  selector: 'app-plant-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './plant-detail.component.html',
  styleUrl: './plant-detail.component.scss',
})
export class PlantDetailComponent implements OnInit {
  readonly i18n = inject(I18nService);
  readonly cart = inject(CartService);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  readonly plant = signal<Plant | null>(null);
  readonly error = signal(false);
  readonly toastVisible = signal(false);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.api.getPlant(slug).subscribe({
      next: (plant) => this.plant.set(plant),
      error: () => this.error.set(true),
    });
  }

  t(path: string): string {
    return this.i18n.t(path);
  }

  money(value: number | null | undefined): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(Number(value) || 0));
  }

  addToCart(): void {
    const plant = this.plant();
    if (!plant) return;
    this.cart.addPlant(plant);
    this.showToast();
  }

  dismissToast(): void {
    this.toastVisible.set(false);
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
  }

  field(field: string): string {
    const plant = this.plant();
    if (!plant) return '';

    if (field === 'light') {
      return this.i18n.t(`catalog.lightOptions.${normalizeLight(plant.lightEs || plant.lightEn)}`);
    }
    if (field === 'water') {
      return this.i18n.t(`catalog.waterOptions.${normalizeWater(plant.waterEs || plant.waterEn)}`);
    }
    if (field === 'humidity') {
      return this.i18n.t(
        `catalog.humidityOptions.${normalizeHumidity(plant.humidityEs || plant.humidityEn)}`,
      );
    }

    return this.i18n.plantField(plant, field);
  }

  private showToast(): void {
    this.toastVisible.set(true);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.dismissToast(), 2800);
  }
}
