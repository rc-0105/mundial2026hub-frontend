import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportesService, AciertosUsuario } from '../../core/services/reportes.service';

@Component({
  selector: 'app-reportes',
  imports: [FormsModule],
  template: `
    <div class="page-container">
      <h1>Reportes</h1>
      <p class="subtitle">Estadísticas y exportación de datos de la plataforma</p>

      <div class="report-card">
        <h2>Predicciones acertadas por usuario</h2>
        <p class="section-desc">
          Porcentaje de aciertos de cada usuario, ordenado de mayor a menor precisión.
        </p>

        <div class="filter-row">
          <div class="filter-group">
            <label for="idPolla">Filtrar por polla (ID)</label>
            <input
              id="idPolla"
              type="number"
              placeholder="Todas las pollas"
              [(ngModel)]="idPollaFiltro"
              min="1"
            />
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
            <div class="empty-state">No hay datos de aciertos disponibles para los filtros seleccionados.</div>
          } @else {
            <div class="aciertos-summary">
              <div class="summary-item">
                <span class="summary-value">{{ entries.length }}</span>
                <span class="summary-label">Usuarios</span>
              </div>
              <div class="summary-item">
                <span class="summary-value">{{ totalPronosticos }}</span>
                <span class="summary-label">Pronósticos totales</span>
              </div>
              <div class="summary-item">
                <span class="summary-value">{{ totalAciertosResultado }}</span>
                <span class="summary-label">Aciertos resultado</span>
              </div>
              <div class="summary-item">
                <span class="summary-value">{{ totalAciertosExacto }}</span>
                <span class="summary-label">Marcadores exactos</span>
              </div>
            </div>

            <table class="report-table">
              <thead>
                <tr>
                  <th class="col-pos">#</th>
                  <th>Nombre</th>
                  <th class="col-num">Pronósticos</th>
                  <th class="col-num">Aciertos resultado</th>
                  <th class="col-num">Marcador exacto</th>
                  <th class="col-pct">% Acierto</th>
                </tr>
              </thead>
              <tbody>
                @for (e of entries; track e.idUsuario; let i = $index) {
                  <tr>
                    <td class="col-pos">{{ i + 1 }}</td>
                    <td class="col-name">{{ e.nombre }}</td>
                    <td class="col-num">{{ e.totalPronosticosRegistrados }}</td>
                    <td class="col-num">{{ e.pronosticosAcertadosResultado }}</td>
                    <td class="col-num">{{ e.pronosticosAcertadosMarcadorExacto }}</td>
                    <td class="col-pct">
                      <span class="pct-badge" [style.background]="pctColor(e.porcentajeAcierto)">
                        {{ e.porcentajeAcierto }}%
                      </span>
                    </td>
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
      max-width: 960px;
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
    .filter-group input[type="number"] { width: 140px; }
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
    .aciertos-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-top: 1.25rem;
    }
    .summary-item {
      text-align: center;
      padding: 1rem;
      background: var(--gray-50);
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }
    .summary-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--gray-900);
    }
    .summary-label {
      display: block;
      font-size: 0.7rem;
      color: var(--gray-500);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-top: 0.2rem;
    }
    .report-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1.25rem;
      animation: fadeIn 0.4s ease;
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
    .col-pos { text-align: center; width: 40px; font-weight: 600; color: var(--gray-500); }
    .col-name { font-weight: 600; color: var(--gray-900); }
    .col-num { text-align: center; width: 100px; color: var(--gray-700); }
    .col-pct { text-align: center; width: 110px; }
    .pct-badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-sm);
      font-weight: 700;
      font-size: 0.8rem;
      color: white;
    }
  `]
})
export class ReportesComponent {
  private readonly reportesService = inject(ReportesService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly reporte = signal<AciertosUsuario[] | null>(null);

  idPollaFiltro = '';
  fechaInicio = '';
  fechaFin = '';

  get totalPronosticos(): number {
    return this.reporte()?.reduce((s, e) => s + e.totalPronosticosRegistrados, 0) ?? 0;
  }

  get totalAciertosResultado(): number {
    return this.reporte()?.reduce((s, e) => s + e.pronosticosAcertadosResultado, 0) ?? 0;
  }

  get totalAciertosExacto(): number {
    return this.reporte()?.reduce((s, e) => s + e.pronosticosAcertadosMarcadorExacto, 0) ?? 0;
  }

  pctColor(pct: number): string {
    if (pct >= 70) return '#16a34a';
    if (pct >= 40) return '#ca8a04';
    return '#dc2626';
  }

  generar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.reporte.set(null);

    const idPolla = this.idPollaFiltro ? Number(this.idPollaFiltro) : undefined;

    this.reportesService.obtenerAciertosUsuario(
      idPolla,
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
    const idPolla = this.idPollaFiltro ? Number(this.idPollaFiltro) : undefined;

    this.reportesService.exportarAciertosCsv(
      idPolla,
      this.fechaInicio ? `${this.fechaInicio}T00:00:00Z` : undefined,
      this.fechaFin ? `${this.fechaFin}T23:59:59Z` : undefined
    ).subscribe({
      next: csv => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-aciertos.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.error.set('Error al exportar el reporte.');
      }
    });
  }
}
