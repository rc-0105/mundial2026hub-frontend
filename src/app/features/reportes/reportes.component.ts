import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportesService, ActividadPeriodo } from '../../core/services/reportes.service';

@Component({
  selector: 'app-reportes',
  imports: [FormsModule],
  template: `
    <div class="page-container">
      <h1>Reportes</h1>
      <p class="subtitle">Estadísticas y exportación de datos de la plataforma</p>

      <div class="report-card">
        <h2>Actividad por período</h2>
        <p class="section-desc">
          Nuevos usuarios, sesiones, pollas creadas y pronósticos registrados, agrupados por semana o mes.
        </p>

        <div class="filter-row">
          <div class="filter-group">
            <label for="granularidad">Agrupar por</label>
            <select id="granularidad" [(ngModel)]="granularidad">
              <option value="mensual">Mensual</option>
              <option value="semanal">Semanal</option>
            </select>
          </div>
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

        @if (reporte(); as entries) {
          @if (entries.length === 0) {
            <div class="empty-state">No hay datos de actividad para el período seleccionado.</div>
          } @else {
            <div class="actividad-chart">
              @for (e of entries; track e.periodo) {
                <div class="periodo-bar">
                  <div class="periodo-label">{{ formatPeriodo(e.periodo) }}</div>
                  <div class="bar-row">
                    <div class="bar-item">
                      <div class="bar bar-users" [style.width.%]="barWidth(e.nuevosUsuariosRegistrados, 'usuarios')"></div>
                      <span class="bar-value">{{ e.nuevosUsuariosRegistrados }}</span>
                    </div>
                    <div class="bar-item">
                      <div class="bar bar-sesiones" [style.width.%]="barWidth(e.sesionesIniciadas, 'sesiones')"></div>
                      <span class="bar-value">{{ e.sesionesIniciadas }}</span>
                    </div>
                    <div class="bar-item">
                      <div class="bar bar-pollas" [style.width.%]="barWidth(e.pollasCreadas, 'pollas')"></div>
                      <span class="bar-value">{{ e.pollasCreadas }}</span>
                    </div>
                    <div class="bar-item">
                      <div class="bar bar-pronosticos" [style.width.%]="barWidth(e.pronosticosRegistrados, 'pronosticos')"></div>
                      <span class="bar-value">{{ e.pronosticosRegistrados }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>

            <table class="report-table">
              <thead>
                <tr>
                  <th>Período</th>
                  <th class="col-num">Nuevos usuarios</th>
                  <th class="col-num">Sesiones</th>
                  <th class="col-num">Pollas creadas</th>
                  <th class="col-num">Pronósticos</th>
                </tr>
              </thead>
              <tbody>
                @for (e of entries; track e.periodo) {
                  <tr>
                    <td class="col-periodo">{{ formatPeriodo(e.periodo) }}</td>
                    <td class="col-num">{{ e.nuevosUsuariosRegistrados }}</td>
                    <td class="col-num">{{ e.sesionesIniciadas }}</td>
                    <td class="col-num">{{ e.pollasCreadas }}</td>
                    <td class="col-num">{{ e.pronosticosRegistrados }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .report-card {
      max-width: 900px;
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
    .filter-group input, .filter-group select {
      padding: 0.45rem 0.7rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-size: 0.85rem;
      color: var(--gray-700);
      background: white;
    }
    .filter-group select { min-width: 150px; }
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
    .empty-state {
      margin-top: 1.5rem;
      padding: 2rem;
      text-align: center;
      color: var(--gray-400);
      background: var(--gray-50);
      border-radius: var(--radius);
      border: 1px dashed var(--border);
    }
    .actividad-chart {
      margin-top: 1.5rem;
      animation: fadeIn 0.4s ease;
    }
    .periodo-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border);
    }
    .periodo-label {
      min-width: 120px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--gray-700);
    }
    .bar-row {
      flex: 1;
      display: flex;
      gap: 0.5rem;
    }
    .bar-item {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .bar {
      height: 14px;
      border-radius: 3px;
      min-width: 2px;
      transition: width 0.4s ease;
    }
    .bar-users { background: #3b82f6; }
    .bar-sesiones { background: #8b5cf6; }
    .bar-pollas { background: #10b981; }
    .bar-pronosticos { background: #f59e0b; }
    .bar-value {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--gray-500);
      min-width: 24px;
    }
    .report-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1.5rem;
    }
    .report-table th {
      text-align: left;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--gray-400);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0.6rem 0.5rem;
      border-bottom: 2px solid var(--border);
    }
    .report-table td {
      padding: 0.7rem 0.5rem;
      font-size: 0.85rem;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    .report-table tbody tr:hover { background: var(--gray-50); }
    .col-periodo { font-weight: 600; color: var(--gray-900); }
    .col-num { text-align: center; width: 110px; color: var(--gray-700); font-weight: 600; }
  `]
})
export class ReportesComponent {
  private readonly reportesService = inject(ReportesService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly reporte = signal<ActividadPeriodo[] | null>(null);

  granularidad = 'mensual';
  fechaInicio = '';
  fechaFin = '';

  private maxUsuarios = 0;
  private maxSesiones = 0;
  private maxPollas = 0;
  private maxPronosticos = 0;

  formatPeriodo(p: string): string {
    const parts = p.split('-');
    if (p.includes('W')) {
      return `Sem ${parts[1].replace('W', '')} (${parts[0]})`;
    }
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const mes = parseInt(parts[1], 10);
    return `${meses[mes - 1]} ${parts[0]}`;
  }

  barWidth(val: number, type: string): number {
    const max = type === 'usuarios' ? this.maxUsuarios
      : type === 'sesiones' ? this.maxSesiones
      : type === 'pollas' ? this.maxPollas
      : this.maxPronosticos;
    if (max === 0) return 0;
    return Math.max(2, (val / max) * 100);
  }

  generar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.reporte.set(null);

    this.reportesService.obtenerActividad(
      this.granularidad,
      this.fechaInicio ? `${this.fechaInicio}T00:00:00Z` : undefined,
      this.fechaFin ? `${this.fechaFin}T23:59:59Z` : undefined
    ).subscribe({
      next: res => {
        const data = res.data;
        this.maxUsuarios = Math.max(...data.map(e => e.nuevosUsuariosRegistrados), 1);
        this.maxSesiones = Math.max(...data.map(e => e.sesionesIniciadas), 1);
        this.maxPollas = Math.max(...data.map(e => e.pollasCreadas), 1);
        this.maxPronosticos = Math.max(...data.map(e => e.pronosticosRegistrados), 1);
        this.reporte.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al generar el reporte. Intenta nuevamente.');
        this.loading.set(false);
      }
    });
  }

  exportarCsv(): void {
    this.reportesService.exportarActividadCsv(
      this.granularidad,
      this.fechaInicio ? `${this.fechaInicio}T00:00:00Z` : undefined,
      this.fechaFin ? `${this.fechaFin}T23:59:59Z` : undefined
    ).subscribe({
      next: csv => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-actividad.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.error.set('Error al exportar el reporte.');
      }
    });
  }
}
