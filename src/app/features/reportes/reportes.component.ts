import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportesService, ReporteAdopcion } from '../../core/services/reportes.service';

@Component({
  selector: 'app-reportes',
  imports: [FormsModule],
  template: `
    <div class="page-container">
      <h1>Reportes</h1>
      <p class="subtitle">Estadísticas y exportación de datos de la plataforma</p>

      <div class="report-card">
        <h2>Adopción de pollas</h2>
        <p class="section-desc">Comparación de usuarios que participan en pollas vs total de usuarios registrados.</p>

        <div class="filter-row">
          <div class="filter-group">
            <label for="fechaInicio">Fecha inicio</label>
            <input id="fechaInicio" type="date" [(ngModel)]="fechaInicio" />
          </div>
          <div class="filter-group">
            <label for="fechaFin">Fecha fin</label>
            <input id="fechaFin" type="date" [(ngModel)]="fechaFin" />
          </div>
          <div class="filter-actions">
            <button class="btn-primary" (click)="generar()" [disabled]="loading()">
              @if (loading()) {
                Generando...
              } @else {
                Generar reporte
              }
            </button>
            <button class="btn-outline" (click)="exportarCsv()" [disabled]="!reporte()">
              Exportar CSV
            </button>
          </div>
        </div>

        @if (error()) {
          <div class="error">{{ error() }}</div>
        }

        @if (reporte(); as r) {
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ r.totalUsuariosRegistrados }}</div>
              <div class="stat-label">Usuarios registrados</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ r.totalUsuariosApostadores }}</div>
              <div class="stat-label">Usuarios que apostaron</div>
            </div>
            <div class="stat-card stat-highlight">
              <div class="stat-value">{{ r.porcentajeParticipacion }}%</div>
              <div class="stat-label">Participación</div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .report-card {
      max-width: 700px;
      margin-top: 1.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2rem;
      box-shadow: var(--shadow);
    }
    .report-card h2 { font-size: 1.15rem; font-weight: 700; color: var(--gray-900); margin-bottom: 0.25rem; }
    .filter-row {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
      flex-wrap: wrap;
      margin-top: 1.25rem;
      padding: 1.25rem;
      background: var(--gray-50);
      border-radius: var(--radius);
      border: 1px solid var(--border);
    }
    .filter-group { display: flex; flex-direction: column; gap: 0.3rem; }
    .filter-group label { font-size: 0.75rem; font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.04em; }
    .filter-group input {
      padding: 0.45rem 0.7rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-size: 0.85rem;
      color: var(--gray-700);
      background: white;
    }
    .filter-actions { display: flex; gap: 0.5rem; margin-left: auto; }
    .btn-outline {
      padding: 0.5rem 1.25rem;
      background: transparent;
      color: var(--primary);
      border: 1px solid var(--primary);
      border-radius: var(--radius);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-outline:hover { background: var(--primary-light); }
    .btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-top: 1.5rem;
      animation: fadeIn 0.4s ease;
    }
    .stat-card {
      text-align: center;
      padding: 1.5rem 1rem;
      background: var(--gray-50);
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }
    .stat-highlight {
      background: var(--primary-light);
      border-color: var(--primary);
    }
    .stat-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--gray-900);
      line-height: 1.2;
    }
    .stat-highlight .stat-value { color: var(--primary-dark); }
    .stat-label {
      font-size: 0.75rem;
      color: var(--gray-500);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-top: 0.3rem;
    }
  `]
})
export class ReportesComponent {
  private readonly reportesService = inject(ReportesService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly reporte = signal<ReporteAdopcion | null>(null);

  fechaInicio = '';
  fechaFin = '';

  generar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.reporte.set(null);

    this.reportesService.obtenerAdopcion(
      this.fechaInicio ? `${this.fechaInicio}T00:00:00Z` : undefined,
      this.fechaFin ? `${this.fechaFin}T23:59:59Z` : undefined
    ).subscribe({
      next: res => {
        this.reporte.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al generar el reporte. Intenta nuevamente.');
        this.loading.set(false);
      }
    });
  }

  exportarCsv(): void {
    this.reportesService.exportarAdopcionCsv(
      this.fechaInicio ? `${this.fechaInicio}T00:00:00Z` : undefined,
      this.fechaFin ? `${this.fechaFin}T23:59:59Z` : undefined
    ).subscribe({
      next: csv => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-adopcion.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.error.set('Error al exportar el reporte.');
      }
    });
  }
}
