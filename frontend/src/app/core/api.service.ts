import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Appointment, BlogPost, CreateAppointmentDto, GalleryItem, Plant } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getPlants(): Observable<Plant[]> {
    return this.http.get<Plant[]>(`${this.base}/plants`);
  }

  getPlant(slug: string): Observable<Plant> {
    return this.http.get<Plant>(`${this.base}/plants/${slug}`);
  }

  getPosts(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(`${this.base}/posts`);
  }

  getPost(slug: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.base}/posts/${slug}`);
  }

  createAppointment(dto: CreateAppointmentDto): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.base}/appointments`, dto);
  }

  login(email: string, password: string): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(`${this.base}/auth/login`, {
      email,
      password,
    });
  }

  changePassword(
    token: string,
    currentPassword: string,
    newPassword: string
  ): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(
      `${this.base}/auth/change-password`,
      { currentPassword, newPassword },
      { headers: this.auth(token) }
    );
  }

  adminPlants(token: string): Observable<Plant[]> {
    return this.http.get<Plant[]>(`${this.base}/admin/plants`, {
      headers: this.auth(token),
    });
  }

  upsertPlant(token: string, plant: Partial<Plant> & { id?: number }): Observable<Plant> {
    if (plant.id) {
      return this.http.patch<Plant>(`${this.base}/admin/plants/${plant.id}`, plant, {
        headers: this.auth(token),
      });
    }
    return this.http.post<Plant>(`${this.base}/admin/plants`, plant, {
      headers: this.auth(token),
    });
  }

  deletePlant(token: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/plants/${id}`, {
      headers: this.auth(token),
    });
  }

  adminAppointments(token: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.base}/admin/appointments`, {
      headers: this.auth(token),
    });
  }

  updateAppointmentStatus(
    token: string,
    id: number,
    status: Appointment['status']
  ): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${this.base}/admin/appointments/${id}`,
      { status },
      { headers: this.auth(token) }
    );
  }

  getGallery(): Observable<GalleryItem[]> {
    return this.http.get<GalleryItem[]>(`${this.base}/gallery`);
  }

  adminGallery(token: string): Observable<GalleryItem[]> {
    return this.http.get<GalleryItem[]>(`${this.base}/admin/gallery`, {
      headers: this.auth(token),
    });
  }

  createGalleryItem(token: string, formData: FormData): Observable<GalleryItem> {
    return this.http.post<GalleryItem>(`${this.base}/admin/gallery`, formData, {
      headers: this.auth(token),
    });
  }

  updateGalleryItem(token: string, id: number, formData: FormData): Observable<GalleryItem> {
    return this.http.patch<GalleryItem>(`${this.base}/admin/gallery/${id}`, formData, {
      headers: this.auth(token),
    });
  }

  deleteGalleryItem(token: string, id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.base}/admin/gallery/${id}`, {
      headers: this.auth(token),
    });
  }

  mediaUrl(path: string): string {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return `${this.base}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private auth(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
