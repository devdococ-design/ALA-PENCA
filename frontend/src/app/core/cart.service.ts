import { Injectable, computed, signal } from '@angular/core';
import type { CartItem, Plant } from './models';

const STORAGE_KEY = 'tj-cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsSignal = signal<CartItem[]>(this.readStorage());

  readonly items = this.itemsSignal.asReadonly();
  readonly count = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0),
  );
  readonly total = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  addPlant(plant: Plant, quantity = 1): void {
    const price = Math.round(Number(plant.price) || 0);
    const qty = Math.max(1, Math.round(quantity));
    const current = [...this.itemsSignal()];
    const index = current.findIndex((item) => item.plantId === plant.id);

    if (index >= 0) {
      current[index] = {
        ...current[index],
        quantity: current[index].quantity + qty,
        price,
        nameEs: plant.nameEs,
        nameEn: plant.nameEn,
        imageUrl: plant.imageUrl,
        slug: plant.slug,
      };
    } else {
      current.push({
        plantId: plant.id,
        slug: plant.slug,
        nameEs: plant.nameEs,
        nameEn: plant.nameEn,
        imageUrl: plant.imageUrl,
        price,
        quantity: qty,
      });
    }

    this.persist(current);
  }

  setQuantity(plantId: number, quantity: number): void {
    const qty = Math.round(quantity);
    if (qty <= 0) {
      this.remove(plantId);
      return;
    }

    this.persist(
      this.itemsSignal().map((item) =>
        item.plantId === plantId ? { ...item, quantity: qty } : item,
      ),
    );
  }

  increment(plantId: number): void {
    const item = this.itemsSignal().find((entry) => entry.plantId === plantId);
    if (!item) return;
    this.setQuantity(plantId, item.quantity + 1);
  }

  decrement(plantId: number): void {
    const item = this.itemsSignal().find((entry) => entry.plantId === plantId);
    if (!item) return;
    this.setQuantity(plantId, item.quantity - 1);
  }

  remove(plantId: number): void {
    this.persist(this.itemsSignal().filter((item) => item.plantId !== plantId));
  }

  clear(): void {
    this.persist([]);
  }

  private persist(items: CartItem[]): void {
    this.itemsSignal.set(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  private readStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as CartItem[];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item) => item && typeof item.plantId === 'number')
        .map((item) => ({
          plantId: item.plantId,
          slug: String(item.slug ?? ''),
          nameEs: String(item.nameEs ?? ''),
          nameEn: String(item.nameEn ?? item.nameEs ?? ''),
          imageUrl: String(item.imageUrl ?? ''),
          price: Math.round(Number(item.price) || 0),
          quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
        }));
    } catch {
      return [];
    }
  }
}
