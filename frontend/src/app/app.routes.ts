import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'pedidos',
    loadComponent: () =>
      import('./pages/hospital/hospital.component').then((m) => m.HospitalComponent),
  },
  { path: 'hospital', redirectTo: 'pedidos', pathMatch: 'full' },
  {
    path: 'tips',
    loadComponent: () => import('./pages/blog/blog.component').then((m) => m.BlogComponent),
  },
  {
    path: 'tips/:slug',
    loadComponent: () =>
      import('./pages/blog-detail/blog-detail.component').then((m) => m.BlogDetailComponent),
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./pages/admin/admin-login.component').then((m) => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/admin.component').then((m) => m.AdminComponent),
  },
  { path: '**', redirectTo: '' },
];
