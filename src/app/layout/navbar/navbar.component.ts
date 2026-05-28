import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { NotificacionesService } from '../../core/services/notificaciones.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-inner">
        <a routerLink="/agenda" class="nav-brand" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
          <span class="brand-icon">M26</span>
          <span class="brand-text">Mundial 2026 Hub</span>
        </a>
        <div class="nav-links">
          <a routerLink="/agenda" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Agenda</a>
          <a routerLink="/partidos" routerLinkActive="active">Partidos</a>
          <a routerLink="/preferencias" routerLinkActive="active">Preferencias</a>
          <a routerLink="/perfil" routerLinkActive="active">Perfil</a>
          <a routerLink="/pollas" routerLinkActive="active">Pollas</a>
          <a routerLink="/notificaciones" routerLinkActive="active" style="position: relative;">
            Notificaciones
            @if (noLeidasCount() > 0) {
              <span class="notif-badge">{{ noLeidasCount() }}</span>
            }
          </a>
          <a routerLink="/reportes" routerLinkActive="active">Reportes</a>
        </div>
        <div class="nav-user">
          <span class="user-name">{{ auth.currentUser()?.nombre }}</span>
          <button class="btn-logout" (click)="logout()">Cerrar sesión</button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      padding: 0 1.5rem;
      height: 60px;
      gap: 1.5rem;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--gray-900);
      font-weight: 700;
      font-size: 1.1rem;
      white-space: nowrap;
    }
    .nav-brand:hover {
      opacity: 0.8;
      text-decoration: none;
    }
    .brand-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: white;
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      padding: 0.25rem 0.55rem;
      border-radius: 0.4rem;
      line-height: 1;
    }
    .nav-links {
      display: flex;
      gap: 0.25rem;
      flex: 1;
    }
    .nav-links a {
      color: var(--gray-500);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      padding: 0.4rem 0.75rem;
      border-radius: var(--radius);
      transition: all 0.2s;
      white-space: nowrap;
    }
    .nav-links a:hover {
      color: var(--gray-900);
      background: var(--gray-50);
      text-decoration: none;
    }
    .nav-links a.active {
      color: var(--primary);
      background: var(--primary-light);
    }
    .nav-user {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }
    .user-name {
      font-size: 0.85rem;
      color: var(--gray-600);
      font-weight: 500;
    }
    .btn-logout {
      padding: 0.4rem 0.9rem;
      background: var(--gray-100);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--gray-600);
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-logout:hover {
      background: #fee2e2;
      border-color: #fecaca;
      color: #dc2626;
    }
    .notif-badge {
      position: absolute;
      top: -2px;
      right: -6px;
      background: #dc2626;
      color: white;
      font-size: 0.6rem;
      font-weight: 700;
      min-width: 16px;
      height: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      line-height: 1;
    }
  `]
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  private readonly notificacionesService = inject(NotificacionesService);
  readonly noLeidasCount = signal(0);

  constructor() {
    this.notificacionesService.obtenerNoLeidas().subscribe({
      next: res => this.noLeidasCount.set(res.data.length),
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
