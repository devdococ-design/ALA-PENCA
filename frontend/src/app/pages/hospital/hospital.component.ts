import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n.service';

type PackageItemId = 'pollo' | 'costilla' | 'combinado' | 'chamorro' | 'grande';
type PackageGroupId = 'sencillo' | 'cueritos' | 'especial';

type PackageItem = {
  id: PackageItemId;
  selected: boolean;
  qty: number;
};

type PackageGroup = {
  id: PackageGroupId;
  items: PackageItem[];
};

const PACKAGE_PRICES: Record<PackageGroupId, number> = {
  sencillo: 190,
  cueritos: 190,
  especial: 290,
};

const initialPackages = (): PackageGroup[] => [
  {
    id: 'sencillo',
    items: [
      { id: 'pollo', selected: false, qty: 0 },
      { id: 'costilla', selected: false, qty: 0 },
      { id: 'combinado', selected: false, qty: 0 },
    ],
  },
  {
    id: 'cueritos',
    items: [
      { id: 'pollo', selected: false, qty: 0 },
      { id: 'costilla', selected: false, qty: 0 },
      { id: 'chamorro', selected: false, qty: 0 },
    ],
  },
  {
    id: 'especial',
    items: [{ id: 'grande', selected: false, qty: 0 }],
  },
];

@Component({
  selector: 'app-hospital',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './hospital.component.html',
  styleUrl: './hospital.component.scss',
})
export class HospitalComponent {
  readonly i18n = inject(I18nService);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  readonly status = signal<'idle' | 'ok' | 'error'>('idle');
  readonly submitting = signal(false);
  readonly toastVisible = signal(false);
  readonly scheduleError = signal('');
  readonly packagesError = signal('');
  readonly focusTarget = signal<string | null>(null);
  readonly packages = signal<PackageGroup[]>(initialPackages());
  readonly minDate = this.toDateInputValue(new Date());
  readonly timeSlots = this.buildSlots(9, 16);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private focusTimer: ReturnType<typeof setTimeout> | null = null;

  readonly form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^(?=.*\d.*\d.*\d.*\d.*\d.*\d.*\d)[\d\s()+.-]+$/)]],
    preferredDate: ['', Validators.required],
    preferredTime: ['', Validators.required],
    notes: [''],
    paymentMethod: ['cash' as 'cash' | 'transfer' | 'later', Validators.required],
  });

  t(path: string): string {
    return this.i18n.t(path);
  }

  menuPackages() {
    return this.i18n.list('menu.packages');
  }

  toggleItem(groupId: PackageGroupId, itemId: PackageItemId, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.updateItem(groupId, itemId, (item) => ({
      ...item,
      selected: checked,
      qty: checked ? Math.max(item.qty, 1) : 0,
    }));
    this.packagesError.set('');
  }

  changeQty(groupId: PackageGroupId, itemId: PackageItemId, delta: number): void {
    this.updateItem(groupId, itemId, (item) => {
      const qty = Math.max(0, item.qty + delta);
      return { ...item, qty, selected: qty > 0 };
    });
    this.packagesError.set('');
  }

  onDateChange(): void {
    this.validateSelectedDate();
  }

  invalid(
    control: 'customerName' | 'email' | 'phone' | 'preferredDate' | 'preferredTime' | 'paymentMethod',
  ): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }

  orderTotal(): number {
    return this.packages().reduce(
      (sum, group) =>
        sum +
        group.items
          .filter((item) => item.selected && item.qty > 0)
          .reduce((inner, item) => inner + item.qty * PACKAGE_PRICES[group.id], 0),
      0,
    );
  }

  submit(): void {
    this.status.set('idle');
    this.validateSelectedDate();

    const orderLines = this.selectedLines();
    if (orderLines.length === 0) {
      this.packagesError.set(this.t('hospital.packagesRequired'));
    }

    if (this.form.invalid || this.scheduleError() || orderLines.length === 0) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid(orderLines.length === 0);
      return;
    }

    const raw = this.form.getRawValue();
    const preferredDate = `${raw.preferredDate} ${raw.preferredTime}`;

    this.submitting.set(true);
    this.api
      .createAppointment({
        customerName: raw.customerName.trim(),
        email: raw.email.trim() || undefined,
        phone: raw.phone.trim(),
        plantIssue: orderLines.join(' · '),
        preferredDate,
        notes: raw.notes.trim() || undefined,
        total: this.orderTotal(),
        paymentMethod: raw.paymentMethod,
      })
      .subscribe({
        next: () => {
          this.status.set('idle');
          this.form.reset({
            customerName: '',
            email: '',
            phone: '',
            preferredDate: '',
            preferredTime: '',
            notes: '',
            paymentMethod: 'cash',
          });
          this.packages.set(initialPackages());
          this.scheduleError.set('');
          this.packagesError.set('');
          this.submitting.set(false);
          this.showToast();
        },
        error: () => {
          this.status.set('error');
          this.submitting.set(false);
        },
      });
  }

  dismissToast(): void {
    this.toastVisible.set(false);
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
  }

  private selectedLines(): string[] {
    return this.packages().flatMap((group) =>
      group.items
        .filter((item) => item.selected && item.qty > 0)
        .map(
          (item) =>
            `${this.t(`hospital.groups.${group.id}`)}: ${this.t(`hospital.items.${item.id}`)} x${item.qty}`,
        ),
    );
  }

  private updateItem(
    groupId: PackageGroupId,
    itemId: PackageItemId,
    updater: (item: PackageItem) => PackageItem,
  ): void {
    this.packages.update((groups) =>
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              items: group.items.map((item) => (item.id === itemId ? updater(item) : item)),
            }
          : group,
      ),
    );
  }

  private focusFirstInvalid(missingPackages: boolean): void {
    const order: Array<{ key: string; selector: string; check: () => boolean }> = [
      {
        key: 'customerName',
        selector: '#name',
        check: () => this.form.controls.customerName.invalid,
      },
      {
        key: 'phone',
        selector: '#phone',
        check: () => this.form.controls.phone.invalid,
      },
      {
        key: 'email',
        selector: '#email',
        check: () => this.form.controls.email.invalid,
      },
      {
        key: 'packages',
        selector: '#packages',
        check: () => missingPackages,
      },
      {
        key: 'preferredDate',
        selector: '#date',
        check: () => this.form.controls.preferredDate.invalid || !!this.scheduleError(),
      },
      {
        key: 'preferredTime',
        selector: '#time',
        check: () => this.form.controls.preferredTime.invalid,
      },
    ];

    const target = order.find((item) => item.check());
    if (!target) return;

    this.focusTarget.set(target.key);
    if (this.focusTimer) clearTimeout(this.focusTimer);
    this.focusTimer = setTimeout(() => this.focusTarget.set(null), 1800);

    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(target.selector);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof el.focus === 'function') {
        el.focus({ preventScroll: true });
      }
    });
  }

  private showToast(): void {
    this.toastVisible.set(true);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.dismissToast(), 3500);
  }

  private validateSelectedDate(): void {
    const value = this.form.controls.preferredDate.value;
    if (!value) {
      this.scheduleError.set('');
      return;
    }

    const day = this.parseLocalDate(value);
    if (!day) {
      this.scheduleError.set(this.t('hospital.invalidDate'));
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (day < today) {
      this.scheduleError.set(this.t('hospital.pastDate'));
      return;
    }

    if (!this.isWeekend(day)) {
      this.scheduleError.set(this.t('hospital.weekdayOnly'));
      return;
    }

    this.scheduleError.set('');
  }

  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  private buildSlots(startHour: number, endHour: number): string[] {
    const slots: string[] = [];
    for (let minutes = startHour * 60; minutes <= endHour * 60; minutes += 20) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
    return slots;
  }

  private parseLocalDate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private toDateInputValue(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
