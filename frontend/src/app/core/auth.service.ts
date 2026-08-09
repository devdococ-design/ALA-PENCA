import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly token = signal<string | null>(localStorage.getItem('tj-token'));

  constructor(
    private readonly api: ApiService,
    private readonly router: Router
  ) {}

  get isLoggedIn(): boolean {
    return !!this.token();
  }

  login(email: string, password: string) {
    return this.api.login(email, password).pipe(
      tap((res) => {
        localStorage.setItem('tj-token', res.access_token);
        this.token.set(res.access_token);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('tj-token');
    this.token.set(null);
    this.router.navigateByUrl('/admin/login');
  }
}
