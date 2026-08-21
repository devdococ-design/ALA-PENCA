import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';
import type { Appointment, GalleryItem } from '../../core/models';

interface WeatherInfo {
  temp: number;
  feelsLike: number;
  humidity: number;
  wind: number;
  code: number;
  label: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit, OnDestroy {
  readonly i18n = inject(I18nService);
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  readonly adminName = 'Admin';
  readonly locationName = 'Cuautitlán Izcalli';

  readonly tab = signal<'appointments' | 'history' | 'password' | 'gallery'>('appointments');
  readonly appointments = signal<Appointment[]>([]);
  readonly appointmentsError = signal('');
  readonly galleryItems = signal<GalleryItem[]>([]);
  readonly passwordStatus = signal<'idle' | 'ok' | 'error'>('idle');
  readonly passwordError = signal('');
  readonly galleryFile = signal<File | null>(null);
  readonly galleryPreview = signal('');
  readonly galleryStatus = signal<'idle' | 'ok' | 'error'>('idle');
  readonly galleryMessage = signal('');
  readonly historyPage = signal(1);
  readonly historyPageSize = 10;
  readonly historyFilterBy = signal<'customer' | 'phone' | 'date'>('customer');
  readonly historyFilterText = signal('');
  readonly historyFilterDate = signal('');

  readonly now = signal(new Date());
  readonly greeting = signal('');
  readonly season = signal('');
  readonly weather = signal<WeatherInfo | null>(null);
  readonly weatherError = signal(false);

  private clockId: ReturnType<typeof setInterval> | null = null;

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: [''],
    newPassword: [''],
    confirmPassword: [''],
  });

  readonly galleryForm = this.fb.nonNullable.group({
    id: [0],
    description: [''],
    sortOrder: [0],
    imageUrl: [''],
  });

  ngOnInit(): void {
    this.tick();
    this.clockId = setInterval(() => this.tick(), 1000);
    this.reload();
    this.loadWeather();
  }

  ngOnDestroy(): void {
    if (this.clockId) clearInterval(this.clockId);
  }

  t(path: string): string {
    return this.i18n.t(path);
  }

  clockTime(): string {
    return this.now().toLocaleTimeString(this.locale(), {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  clockDate(): string {
    return this.now().toLocaleDateString(this.locale(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  pendingCount(): number {
    return this.activeOrders().filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED').length;
  }

  activeOrders(): Appointment[] {
    return this.appointments().filter((a) => a.status !== 'DONE');
  }

  deliveredCount(): number {
    return this.appointments().filter((a) => a.status === 'DONE').length;
  }

  historyOrders(): Appointment[] {
    const field = this.historyFilterBy();
    const text = this.historyFilterText().trim().toLowerCase();
    const date = this.historyFilterDate();
    const phoneQuery = this.normalizePhone(this.historyFilterText());

    return this.appointments()
      .filter((a) => a.status === 'DONE')
      .filter((a) => {
        if (field === 'date') {
          if (!date) return true;
          return (a.preferredDate || '').startsWith(date);
        }
        if (field === 'phone') {
          if (!phoneQuery) return true;
          return this.normalizePhone(a.phone).includes(phoneQuery);
        }
        if (!text) return true;
        return a.customerName.toLowerCase().includes(text);
      })
      .sort((a, b) => {
        const aDate = a.deliveredAt || a.createdAt || a.preferredDate || '';
        const bDate = b.deliveredAt || b.createdAt || b.preferredDate || '';
        return String(bDate).localeCompare(String(aDate));
      });
  }

  onHistoryFilterBy(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'customer' | 'phone' | 'date';
    this.historyFilterBy.set(value);
    this.historyFilterText.set('');
    this.historyFilterDate.set('');
    this.historyPage.set(1);
  }

  onHistoryFilterText(event: Event): void {
    this.historyFilterText.set((event.target as HTMLInputElement).value);
    this.historyPage.set(1);
  }

  onHistoryFilterDate(event: Event): void {
    this.historyFilterDate.set((event.target as HTMLInputElement).value);
    this.historyPage.set(1);
  }

  clearHistoryFilter(): void {
    this.historyFilterText.set('');
    this.historyFilterDate.set('');
    this.historyPage.set(1);
  }

  private normalizePhone(value: string): string {
    return value.replace(/\D+/g, '');
  }

  pagedHistory(): Appointment[] {
    const page = this.historyPage();
    const start = (page - 1) * this.historyPageSize;
    return this.historyOrders().slice(start, start + this.historyPageSize);
  }

  historyPageCount(): number {
    return Math.max(1, Math.ceil(this.historyOrders().length / this.historyPageSize));
  }

  historyRangeLabel(): string {
    const total = this.historyOrders().length;
    if (total === 0) return '';
    const start = (this.historyPage() - 1) * this.historyPageSize + 1;
    const end = Math.min(this.historyPage() * this.historyPageSize, total);
    return this.t('admin.historyRange')
      .replace('{start}', String(start))
      .replace('{end}', String(end))
      .replace('{total}', String(total));
  }

  prevHistoryPage(): void {
    this.historyPage.set(Math.max(1, this.historyPage() - 1));
  }

  nextHistoryPage(): void {
    this.historyPage.set(Math.min(this.historyPageCount(), this.historyPage() + 1));
  }

  orderTotal(item: Appointment): number {
    if (typeof item.total === 'number') return item.total;
    return this.estimateTotal(item.plantIssue);
  }

  historyGrandTotal(): number {
    return this.pagedHistory().reduce((sum, item) => sum + this.orderTotal(item), 0);
  }

  formatMoney(value: number): string {
    return `$${value.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  paymentLabel(method?: string | null): string {
    if (method === 'cash') return this.t('admin.paymentCash');
    if (method === 'transfer') return this.t('admin.paymentTransfer');
    if (method === 'later') return this.t('admin.paymentLater');
    return this.t('admin.paymentUnknown');
  }

  private estimateTotal(packages: string): number {
    return packages.split('·').reduce((sum, part) => {
      const qty = Number(/x\s*(\d+)/i.exec(part)?.[1] ?? 1);
      const text = part.toLowerCase();
      if (/especial|grande/.test(text)) return sum + 290 * qty;
      if (/sencillo|cueritos|pollo|costilla|combinado|chamorro/.test(text)) return sum + 190 * qty;
      return sum;
    }, 0);
  }

  statusLabel(status: Appointment['status']): string {
    switch (status) {
      case 'PENDING':
        return this.t('admin.statusPending');
      case 'CONFIRMED':
        return this.t('admin.statusConfirmed');
      case 'DONE':
        return this.t('admin.statusDelivered');
      case 'CANCELLED':
        return this.t('admin.statusCancelled');
      default:
        return status;
    }
  }

  labelForWeather(code: number): string {
    return this.weatherLabel(code);
  }

  setTab(tab: 'appointments' | 'history' | 'password' | 'gallery'): void {
    this.tab.set(tab);
    this.passwordStatus.set('idle');
    this.passwordError.set('');
    this.galleryStatus.set('idle');
    this.galleryMessage.set('');
    if (tab === 'history') {
      this.historyPage.set(1);
      this.historyFilterBy.set('customer');
      this.historyFilterText.set('');
      this.historyFilterDate.set('');
    }
    if (tab === 'appointments' || tab === 'history' || tab === 'gallery') {
      this.reload();
    }
  }

  mediaUrl(path: string): string {
    return this.api.mediaUrl(path);
  }

  onGalleryFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.galleryFile.set(file);
    if (this.galleryPreview() && this.galleryPreview().startsWith('blob:')) {
      URL.revokeObjectURL(this.galleryPreview());
    }
    this.galleryPreview.set(file ? URL.createObjectURL(file) : '');
  }

  editGalleryItem(item: GalleryItem): void {
    this.galleryForm.patchValue({
      id: item.id,
      description: item.descriptionEs || item.descriptionEn,
      sortOrder: item.sortOrder,
      imageUrl: item.imageUrl,
    });
    this.galleryFile.set(null);
    if (this.galleryPreview() && this.galleryPreview().startsWith('blob:')) {
      URL.revokeObjectURL(this.galleryPreview());
    }
    this.galleryPreview.set(this.mediaUrl(item.imageUrl));
  }

  resetGalleryForm(): void {
    this.galleryForm.reset({
      id: 0,
      description: '',
      sortOrder: this.galleryItems().length,
      imageUrl: '',
    });
    this.galleryFile.set(null);
    if (this.galleryPreview() && this.galleryPreview().startsWith('blob:')) {
      URL.revokeObjectURL(this.galleryPreview());
    }
    this.galleryPreview.set('');
  }

  saveGalleryItem(): void {
    const token = this.auth.token();
    if (!token) return;
    const raw = this.galleryForm.getRawValue();
    const file = this.galleryFile();
    if (!raw.id && !file && !raw.imageUrl) {
      this.galleryStatus.set('error');
      this.galleryMessage.set(this.t('admin.galleryNeedImage'));
      return;
    }

    const description = raw.description.trim();
    const formData = new FormData();
    formData.append('descriptionEs', description);
    formData.append('descriptionEn', description);
    formData.append('sortOrder', String(raw.sortOrder ?? 0));
    if (file) formData.append('image', file);
    else if (raw.imageUrl) formData.append('imageUrl', raw.imageUrl);

    const req$ = raw.id
      ? this.api.updateGalleryItem(token, raw.id, formData)
      : this.api.createGalleryItem(token, formData);

    req$.subscribe({
      next: () => {
        this.galleryStatus.set('ok');
        this.galleryMessage.set(this.t('admin.gallerySaved'));
        this.resetGalleryForm();
        this.reload();
      },
      error: () => {
        this.galleryStatus.set('error');
        this.galleryMessage.set(this.t('admin.galleryFail'));
      },
    });
  }

  removeGalleryItem(id: number): void {
    const token = this.auth.token();
    if (!token) return;
    this.api.deleteGalleryItem(token, id).subscribe({
      next: () => this.reload(),
      error: () => {
        this.galleryStatus.set('error');
        this.galleryMessage.set(this.t('admin.galleryFail'));
      },
    });
  }

  reload(): void {
    const token = this.auth.token();
    if (!token) return;

    this.appointmentsError.set('');
    this.api.adminAppointments(token).subscribe({
      next: (items) => {
        this.appointments.set(items);
        this.historyPage.set(Math.min(this.historyPage(), this.historyPageCount()));
      },
      error: (err) => {
        this.appointments.set([]);
        if (err?.status === 401) {
          this.auth.logout();
          return;
        }
        this.appointmentsError.set(this.t('admin.appointmentsLoadFail'));
      },
    });
    this.api.adminGallery(token).subscribe({
      next: (items) => this.galleryItems.set(items),
      error: (err) => {
        if (err?.status === 401) this.auth.logout();
      },
    });
  }

  setStatus(id: number, status: Appointment['status']): void {
    const token = this.auth.token();
    if (!token) return;
    this.api.updateAppointmentStatus(token, id, status).subscribe(() => this.reload());
  }

  changePassword(): void {
    const token = this.auth.token();
    if (!token) return;

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    this.passwordStatus.set('idle');
    this.passwordError.set('');

    if (!currentPassword || !newPassword) {
      this.passwordStatus.set('error');
      this.passwordError.set(this.t('admin.passwordRequired'));
      return;
    }
    if (newPassword.length < 6) {
      this.passwordStatus.set('error');
      this.passwordError.set(this.t('admin.passwordMin'));
      return;
    }
    if (newPassword !== confirmPassword) {
      this.passwordStatus.set('error');
      this.passwordError.set(this.t('admin.passwordMismatch'));
      return;
    }

    this.api.changePassword(token, currentPassword, newPassword).subscribe({
      next: () => {
        this.passwordStatus.set('ok');
        this.passwordForm.reset({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      },
      error: (err) => {
        this.passwordStatus.set('error');
        const msg = err?.error?.message;
        this.passwordError.set(
          Array.isArray(msg) ? msg[0] : msg || this.t('admin.passwordFail')
        );
      },
    });
  }

  private tick(): void {
    const date = new Date();
    this.now.set(date);
    this.greeting.set(this.buildGreeting(date));
    this.season.set(this.buildSeason(date));
  }

  private locale(): string {
    return this.i18n.lang() === 'en' ? 'en-US' : 'es-MX';
  }

  private buildGreeting(date: Date): string {
    const hour = date.getHours();
    const en = this.i18n.lang() === 'en';
    if (hour < 12) return en ? `Good morning, ${this.adminName}` : `Buenos días, ${this.adminName}`;
    if (hour < 19) return en ? `Good afternoon, ${this.adminName}` : `Buenas tardes, ${this.adminName}`;
    return en ? `Good evening, ${this.adminName}` : `Buenas noches, ${this.adminName}`;
  }

  private buildSeason(date: Date): string {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const en = this.i18n.lang() === 'en';
    if ((m === 3 && d >= 21) || m === 4 || m === 5 || (m === 6 && d < 21)) {
      return en ? 'Spring' : 'Primavera';
    }
    if ((m === 6 && d >= 21) || m === 7 || m === 8 || (m === 9 && d < 23)) {
      return en ? 'Summer' : 'Verano';
    }
    if ((m === 9 && d >= 23) || m === 10 || m === 11 || (m === 12 && d < 21)) {
      return en ? 'Autumn' : 'Otoño';
    }
    return en ? 'Winter' : 'Invierno';
  }

  private loadWeather(): void {
    const lat = 19.4326;
    const lon = -99.1332;
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
      `&timezone=America%2FMexico_City`;

    this.http.get<{
      current: {
        temperature_2m: number;
        apparent_temperature: number;
        relative_humidity_2m: number;
        weather_code: number;
        wind_speed_10m: number;
      };
    }>(url).subscribe({
      next: (res) => {
        const c = res.current;
        this.weather.set({
          temp: Math.round(c.temperature_2m),
          feelsLike: Math.round(c.apparent_temperature),
          humidity: c.relative_humidity_2m,
          wind: Math.round(c.wind_speed_10m),
          code: c.weather_code,
          label: this.weatherLabel(c.weather_code),
        });
        this.weatherError.set(false);
      },
      error: () => {
        this.weather.set(null);
        this.weatherError.set(true);
      },
    });
  }

  private weatherLabel(code: number): string {
    const en = this.i18n.lang() === 'en';
    if (code === 0) return en ? 'Clear sky' : 'Despejado';
    if (code <= 3) return en ? 'Partly cloudy' : 'Parcialmente nublado';
    if (code <= 48) return en ? 'Foggy' : 'Niebla';
    if (code <= 57) return en ? 'Drizzle' : 'Llovizna';
    if (code <= 67) return en ? 'Rain' : 'Lluvia';
    if (code <= 77) return en ? 'Snow' : 'Nieve';
    if (code <= 82) return en ? 'Showers' : 'Chubascos';
    if (code <= 99) return en ? 'Thunderstorm' : 'Tormenta';
    return en ? 'Variable' : 'Variable';
  }
}
