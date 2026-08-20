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

  readonly tab = signal<'appointments' | 'password' | 'gallery'>('appointments');
  readonly appointments = signal<Appointment[]>([]);
  readonly galleryItems = signal<GalleryItem[]>([]);
  readonly passwordStatus = signal<'idle' | 'ok' | 'error'>('idle');
  readonly passwordError = signal('');
  readonly galleryFile = signal<File | null>(null);
  readonly galleryPreview = signal('');
  readonly galleryStatus = signal<'idle' | 'ok' | 'error'>('idle');
  readonly galleryMessage = signal('');

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
    return this.appointments().filter((a) => a.status === 'PENDING').length;
  }

  labelForWeather(code: number): string {
    return this.weatherLabel(code);
  }

  setTab(tab: 'appointments' | 'password' | 'gallery'): void {
    this.tab.set(tab);
    this.passwordStatus.set('idle');
    this.passwordError.set('');
    this.galleryStatus.set('idle');
    this.galleryMessage.set('');
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
    this.api.adminAppointments(token).subscribe((items) => this.appointments.set(items));
    this.api.adminGallery(token).subscribe((items) => this.galleryItems.set(items));
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
