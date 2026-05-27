import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NotificacionesService } from '../../core/services/notificaciones.service';
import { Notificacion } from '../../core/models/notificacion.model';

@Component({
  selector: 'app-notificaciones',
  imports: [DatePipe],
  template: `
    <div class="page-container">
      <h1>Notificaciones</h1>
      <p class="subtitle">Tus alertas y recordatorios de pronósticos</p>

      <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem;">
        <button class="tab-btn" [class.active]="!soloNoLeidas()" (click)="soloNoLeidas.set(false); cargar()">Todas</button>
        <button class="tab-btn" [class.active]="soloNoLeidas()" (click)="soloNoLeidas.set(true); cargar()">No leídas</button>
      </div>

      @if (loading()) {
        <div class="empty-state"><p>Cargando notificaciones...</p></div>
      } @else if (notificaciones(); as list) {
        @if (list.length === 0) {
          <div class="empty-state"><p>No tienes notificaciones pendientes.</p></div>
        } @else {
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            @for (n of list; track n.idNotificacion) {
              <div class="notif-card" [class.notif-unread]="n.estadoEntrega === 'PENDIENTE'">
                <div class="notif-header">
                  <span class="canal-badge" [class.push]="n.canal === 'PUSH'" [class.email]="n.canal === 'EMAIL'">
                    {{ n.canal === 'PUSH' ? '📱 Push' : '✉️ Email' }}
                  </span>
                  <span class="notif-date">{{ n.timestamp | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                <p class="notif-content">{{ n.contenido }}</p>
                <span class="estado-badge" [class.pendiente]="n.estadoEntrega === 'PENDIENTE'"
                  [class.enviada]="n.estadoEntrega === 'ENVIADA'"
                  [class.fallida]="n.estadoEntrega === 'FALLIDA'">
                  {{ n.estadoEntrega === 'PENDIENTE' ? 'Pendiente' : n.estadoEntrega === 'ENVIADA' ? 'Enviada' : 'Fallida' }}
                </span>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .tab-btn {
      padding: 0.5rem 1.25rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface);
      color: var(--gray-700);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }
    .tab-btn:hover:not(.active) { background: var(--gray-100); }
    .notif-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1rem;
      box-shadow: var(--shadow-sm);
      transition: box-shadow 0.2s;
    }
    .notif-card.notif-unread {
      border-left: 3px solid var(--primary);
      background: #f0f7ff;
    }
    .notif-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .canal-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-sm);
    }
    .canal-badge.push { background: #dbeafe; color: #1e40af; }
    .canal-badge.email { background: #fef3c7; color: #92400e; }
    .notif-date {
      font-size: 0.75rem;
      color: var(--gray-400);
    }
    .notif-content {
      font-size: 0.9rem;
      color: var(--gray-800);
      margin: 0 0 0.5rem 0;
      line-height: 1.4;
    }
    .estado-badge {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.15rem 0.45rem;
      border-radius: var(--radius-sm);
    }
    .estado-badge.pendiente { background: #fef3c7; color: #92400e; }
    .estado-badge.enviada { background: #dcfce7; color: #166534; }
    .estado-badge.fallida { background: #fce4ec; color: #c62828; }
  `]
})
export class NotificacionesComponent {
  private readonly notificacionesService = inject(NotificacionesService);

  readonly notificaciones = signal<Notificacion[]>([]);
  readonly loading = signal(false);
  readonly soloNoLeidas = signal(false);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    const obs = this.soloNoLeidas()
      ? this.notificacionesService.obtenerNoLeidas()
      : this.notificacionesService.obtenerMisNotificaciones();

    obs.subscribe({
      next: res => {
        this.notificaciones.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.notificaciones.set([]);
        this.loading.set(false);
      }
    });
  }
}
