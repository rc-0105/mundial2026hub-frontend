import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';
import { onboardingGuard } from './core/auth/guards/onboarding.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'onboarding',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard, onboardingGuard],
    children: [
      { path: '', redirectTo: 'agenda', pathMatch: 'full' },
      {
        path: 'agenda',
        loadComponent: () =>
          import('./features/agenda/agenda.component').then(m => m.AgendaComponent),
      },
      {
        path: 'partidos',
        loadComponent: () =>
          import('./features/partidos/partidos.component').then(m => m.PartidosComponent),
      },
      {
        path: 'partidos/:id',
        loadComponent: () =>
          import('./features/partidos/partido-detalle/partido-detalle.component').then(m => m.PartidoDetalleComponent),
      },
      {
        path: 'partidos/:id/en-vivo',
        loadComponent: () =>
          import('./features/partidos/partido-en-vivo/partido-en-vivo.component').then(m => m.PartidoEnVivoComponent),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/perfil/perfil.component').then(m => m.PerfilComponent),
      },
      {
        path: 'preferencias',
        loadComponent: () =>
          import('./features/preferencias/preferencias.component').then(m => m.PreferenciasComponent),
      },
      {
        path: 'pollas',
        loadComponent: () =>
          import('./features/pollas/pollas.component').then(m => m.PollasComponent),
      },
      {
        path: 'notificaciones',
        loadComponent: () =>
          import('./features/notificaciones/notificaciones.component').then(
            m => m.NotificacionesComponent
          ),
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./features/reportes/reportes.component').then(m => m.ReportesComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
