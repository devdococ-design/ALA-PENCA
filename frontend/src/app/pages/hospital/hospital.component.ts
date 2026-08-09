import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n.service';

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
  readonly emergency = signal(false);
  readonly scheduleError = signal('');
  readonly selectedDate = signal('');
  readonly minDate = this.toDateInputValue(new Date());
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  readonly form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    plantIssue: ['', [Validators.required, Validators.minLength(5)]],
    preferredDate: ['', Validators.required],
    preferredTime: ['', Validators.required],
  });

  readonly timeSlots = computed(() => {
    const dateValue = this.selectedDate();
    if (!dateValue) return [];
    const day = this.parseLocalDate(dateValue);
    if (!day) return [];
    const weekend = this.isWeekend(day);
    if (weekend) {
      return this.emergency() ? this.buildSlots(11, 14) : [];
    }
    return this.buildSlots(10, 17);
  });

  t(path: string): string {
    return this.i18n.t(path);
  }

  toggleEmergency(): void {
    this.emergency.update((value) => !value);
    this.scheduleError.set('');
    this.validateSelectedDate();
    this.syncTimeSelection();
  }

  onDateChange(): void {
    this.selectedDate.set(this.form.controls.preferredDate.value);
    this.validateSelectedDate();
    this.syncTimeSelection();
  }

  invalid(control: 'customerName' | 'email' | 'phone' | 'plantIssue' | 'preferredDate' | 'preferredTime'): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }

  submit(): void {
    this.status.set('idle');
    this.selectedDate.set(this.form.controls.preferredDate.value);
    this.validateSelectedDate();
    this.syncTimeSelection();
    if (this.form.invalid || this.scheduleError()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const preferredDate = this.emergency()
      ? `EMERGENCIA · ${raw.preferredDate} ${raw.preferredTime}`
      : `${raw.preferredDate} ${raw.preferredTime}`;

    this.submitting.set(true);
    this.api
      .createAppointment({
        customerName: raw.customerName.trim(),
        email: raw.email.trim(),
        phone: raw.phone.trim(),
        plantIssue: raw.plantIssue.trim(),
        preferredDate,
      })
      .subscribe({
        next: () => {
          this.status.set('idle');
          this.form.reset({
            customerName: '',
            email: '',
            phone: '',
            plantIssue: '',
            preferredDate: '',
            preferredTime: '',
          });
          this.emergency.set(false);
          this.selectedDate.set('');
          this.scheduleError.set('');
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

  private showToast(): void {
    this.toastVisible.set(true);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.dismissToast(), 3500);
  }

  private syncTimeSelection(): void {
    const time = this.form.controls.preferredTime.value;
    if (time && !this.timeSlots().includes(time)) {
      this.form.controls.preferredTime.setValue('');
    }
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
      this.form.controls.preferredDate.setValue('');
      return;
    }

    if (this.isWeekend(day) && !this.emergency()) {
      this.scheduleError.set(this.t('hospital.weekdayOnly'));
      this.form.controls.preferredDate.setValue('');
      this.form.controls.preferredTime.setValue('');
      return;
    }

    this.scheduleError.set('');
  }

  private buildSlots(startHour: number, endHour: number): string[] {
    const slots: string[] = [];
    for (let minutes = startHour * 60; minutes < endHour * 60; minutes += 20) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
    return slots;
  }

  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
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
