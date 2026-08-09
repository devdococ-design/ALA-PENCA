import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import QRCode from 'qrcode';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';
import { ThemeService } from '../../core/theme.service';
import { COLOR_FIELDS, type ThemeColors } from '../../core/theme.model';
import type { Appointment, BlogPost, GalleryItem, Plant } from '../../core/models';
import {
  HUMIDITY_OPTIONS,
  LIGHT_OPTIONS,
  WATER_OPTIONS,
  normalizeHumidity,
  normalizeLight,
  normalizeWater,
  type HumidityLevel,
  type LightLevel,
  type WaterLevel,
} from '../../core/plant-care';

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
  readonly themeService = inject(ThemeService);
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  readonly adminName = 'Admin';
  readonly locationName = 'México';
  readonly colorFields = COLOR_FIELDS;
  readonly lightOptions = LIGHT_OPTIONS;
  readonly waterOptions = WATER_OPTIONS;
  readonly humidityOptions = HUMIDITY_OPTIONS;

  readonly tab = signal<'plants' | 'appointments' | 'posts' | 'password' | 'design' | 'gallery'>('plants');
  readonly plants = signal<Plant[]>([]);
  readonly appointments = signal<Appointment[]>([]);
  readonly posts = signal<BlogPost[]>([]);
  readonly galleryItems = signal<GalleryItem[]>([]);
  readonly passwordStatus = signal<'idle' | 'ok' | 'error'>('idle');
  readonly passwordError = signal('');
  readonly designStatus = signal<'idle' | 'ok' | 'reset' | 'error'>('idle');
  readonly designMessage = signal('');
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

  readonly plantForm = this.fb.nonNullable.group({
    id: [0],
    slug: [''],
    name: [''],
    scientificName: [''],
    description: [''],
    care: [''],
    light: this.fb.nonNullable.control<LightLevel>('partial'),
    water: this.fb.nonNullable.control<WaterLevel>('moderate'),
    humidity: this.fb.nonNullable.control<HumidityLevel>('medium'),
    imageUrl: [''],
    category: ['interior'],
    price: [this.formatPrice(0)],
    featured: [false],
  });

  readonly postForm = this.fb.nonNullable.group({
    id: [0],
    slug: [''],
    title: [''],
    excerpt: [''],
    content: [''],
    imageUrl: [''],
    published: [true],
  });

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

  setTab(tab: 'plants' | 'appointments' | 'posts' | 'password' | 'design' | 'gallery'): void {
    this.tab.set(tab);
    this.passwordStatus.set('idle');
    this.passwordError.set('');
    this.designStatus.set('idle');
    this.designMessage.set('');
    this.galleryStatus.set('idle');
    this.galleryMessage.set('');
  }

  mediaUrl(path: string): string {
    return this.api.mediaUrl(path);
  }

  formatPrice(value: number | string | null | undefined): string {
    const amount = Math.round(this.parsePrice(value));
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  parsePrice(value: number | string | null | undefined): number {
    if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value) : 0;
    const digits = String(value ?? '').replace(/[^\d]/g, '');
    return digits ? Number(digits) : 0;
  }

  formatPriceField(): void {
    const parsed = this.parsePrice(this.plantForm.controls.price.value);
    this.plantForm.controls.price.setValue(this.formatPrice(parsed));
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

  colorLabel(field: (typeof COLOR_FIELDS)[number]): string {
    return this.i18n.lang() === 'en' ? field.labelEn : field.labelEs;
  }

  colorValue(key: keyof ThemeColors): string {
    return this.themeService.theme().colors[key];
  }

  onColorInput(key: keyof ThemeColors, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.themeService.setColor(key, value);
  }

  onColorText(key: keyof ThemeColors, event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
      this.themeService.setColor(key, value);
    }
  }

  selectFont(pairId: string): void {
    this.themeService.setFontPair(pairId);
  }

  async saveDesign(): Promise<void> {
    const token = this.auth.token();
    if (!token) return;
    try {
      await this.themeService.save(token);
      this.designStatus.set('ok');
      this.designMessage.set(this.t('admin.designSaved'));
    } catch {
      this.designStatus.set('error');
      this.designMessage.set(this.t('admin.designFail'));
    }
  }

  async resetDesign(): Promise<void> {
    const token = this.auth.token();
    if (!token) return;
    try {
      await this.themeService.reset(token);
      this.designStatus.set('reset');
      this.designMessage.set(this.t('admin.designReset'));
    } catch {
      this.designStatus.set('error');
      this.designMessage.set(this.t('admin.designFail'));
    }
  }

  reload(): void {
    const token = this.auth.token();
    if (!token) return;
    this.api.adminPlants(token).subscribe((plants) => this.plants.set(plants));
    this.api.adminAppointments(token).subscribe((items) => this.appointments.set(items));
    this.api.adminPosts(token).subscribe((posts) => this.posts.set(posts));
    this.api.adminGallery(token).subscribe((items) => this.galleryItems.set(items));
  }

  editPlant(plant: Plant): void {
    this.plantForm.patchValue({
      id: plant.id,
      slug: plant.slug,
      name: plant.nameEs || plant.nameEn,
      scientificName: plant.scientificName,
      description: plant.descriptionEs || plant.descriptionEn,
      care: plant.careEs || plant.careEn,
      light: normalizeLight(plant.lightEs || plant.lightEn),
      water: normalizeWater(plant.waterEs || plant.waterEn),
      humidity: normalizeHumidity(plant.humidityEs || plant.humidityEn),
      imageUrl: plant.imageUrl,
      category: plant.category,
      price: this.formatPrice(plant.price ?? 0),
      featured: plant.featured,
    });
  }

  async downloadQr(plant: Plant): Promise<void> {
    const url = `${window.location.origin}/p/${plant.slug}`;
    const dataUrl = await QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      color: { dark: '#1c1d19', light: '#f2eee4' },
    });
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qr-${plant.slug}.png`;
    link.click();
  }

  savePlant(): void {
    const token = this.auth.token();
    if (!token) return;
    const raw = this.plantForm.getRawValue();
    const light = normalizeLight(raw.light);
    const water = normalizeWater(raw.water);
    const humidity = normalizeHumidity(raw.humidity);
    const name = raw.name.trim();
    const description = raw.description.trim();
    const care = raw.care.trim();
    const payload = {
      id: raw.id || undefined,
      slug: raw.slug,
      nameEs: name,
      nameEn: name,
      scientificName: raw.scientificName,
      descriptionEs: description,
      descriptionEn: description,
      careEs: care,
      careEn: care,
      lightEs: light,
      lightEn: light,
      waterEs: water,
      waterEn: water,
      humidityEs: humidity,
      humidityEn: humidity,
      imageUrl: raw.imageUrl,
      category: raw.category,
      price: this.parsePrice(raw.price) || null,
      featured: raw.featured,
    };
    this.api.upsertPlant(token, payload).subscribe(() => {
      this.plantForm.reset({
        id: 0,
        slug: '',
        name: '',
        scientificName: '',
        description: '',
        care: '',
        light: 'partial',
        water: 'moderate',
        humidity: 'medium',
        imageUrl: '',
        category: 'interior',
        price: this.formatPrice(0),
        featured: false,
      });
      this.reload();
    });
  }

  removePlant(id: number): void {
    const token = this.auth.token();
    if (!token) return;
    this.api.deletePlant(token, id).subscribe(() => this.reload());
  }

  setStatus(id: number, status: Appointment['status']): void {
    const token = this.auth.token();
    if (!token) return;
    this.api.updateAppointmentStatus(token, id, status).subscribe(() => this.reload());
  }

  editPost(post: BlogPost): void {
    this.postForm.patchValue({
      id: post.id,
      slug: post.slug,
      title: post.titleEs || post.titleEn,
      excerpt: post.excerptEs || post.excerptEn,
      content: post.contentEs || post.contentEn,
      imageUrl: post.imageUrl,
      published: post.published,
    });
  }

  savePost(): void {
    const token = this.auth.token();
    if (!token) return;
    const raw = this.postForm.getRawValue();
    const title = raw.title.trim();
    const excerpt = raw.excerpt.trim();
    const content = raw.content.trim();
    const payload = {
      id: raw.id || undefined,
      slug: raw.slug,
      titleEs: title,
      titleEn: title,
      excerptEs: excerpt,
      excerptEn: excerpt,
      contentEs: content,
      contentEn: content,
      imageUrl: raw.imageUrl,
      published: raw.published,
    };
    this.api.upsertPost(token, payload).subscribe(() => {
      this.postForm.reset({
        id: 0,
        slug: '',
        title: '',
        excerpt: '',
        content: '',
        imageUrl: '',
        published: true,
      });
      this.reload();
    });
  }

  removePost(id: number): void {
    const token = this.auth.token();
    if (!token) return;
    this.api.deletePost(token, id).subscribe(() => this.reload());
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
    // Hemisferio norte / México
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
