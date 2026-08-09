import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n.service';
import { LIGHT_OPTIONS, normalizeLight, type LightLevel } from '../../core/plant-care';
import type { Plant } from '../../core/models';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly api = inject(ApiService);
  readonly plants = signal<Plant[]>([]);
  readonly lightFilter = signal<LightLevel | ''>('');
  readonly lightOptions = LIGHT_OPTIONS;

  readonly filteredPlants = computed(() => {
    const filter = this.lightFilter();
    const all = this.plants();
    if (!filter) return all;
    return all.filter((plant) => normalizeLight(plant.lightEs || plant.lightEn) === filter);
  });

  ngOnInit(): void {
    this.api.getPlants().subscribe({
      next: (plants) => this.plants.set(plants),
      error: () => this.plants.set([]),
    });
  }

  t(path: string): string {
    return this.i18n.t(path);
  }

  setLightFilter(value: string): void {
    this.lightFilter.set((value as LightLevel | '') || '');
  }

  name(plant: Plant): string {
    return this.i18n.plantField(plant, 'name');
  }

  description(plant: Plant): string {
    return this.i18n.plantField(plant, 'description');
  }

  lightLabel(plant: Plant): string {
    const code = normalizeLight(plant.lightEs || plant.lightEn);
    return this.i18n.t(`catalog.lightOptions.${code}`);
  }
}
