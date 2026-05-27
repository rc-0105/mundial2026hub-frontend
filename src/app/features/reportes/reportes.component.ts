import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesService, PartidoMasApostado } from '../../core/services/reportes.service';

@Component({
  selector: 'app-reportes',
  imports: [FormsModule, DatePipe],
  template: `
    <div class="page-container">
      <h1>Reportes</h1>
      <p class="subtitle">Estadísticas y exportación de datos de la plataforma</p>

      <div class="report-card">
        <h2>Partidos más apostados</h2>
        <p class="section-desc">
          Partidos ordenados por cantidad de pronósticos recibidos, de mayor a menor interés.
        </p>

        <div class="filter-row">
          <div class="filter-group">
            <label for="fase">Fase del torneo</label>
            <select id="fase" [(ngModel)]="faseFiltro">
              <option value="">Todas las fases</option>
              <option value="GRUPOS">Grupos</option>
              <option value="OCTAVOS">Octavos</option>
              <option value="CUARTOS">Cuartos</option>
              <option value="SEMIFINAL">Semifinal</option>
              <option value="TERCER_PUESTO">Tercer puesto</option>
              <option value="FINAL">Final</option>
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
            <div class="empty-state">No hay partidos con pronósticos registrados.</div>
          } @else {
            <table class="report-table">
              <thead>
                <tr>
                  <th class="col-num">#</th>
                  <th>Partido</th>
                  <th>Fecha</th>
                  <th>Fase</th>
                  <th class="col-num">Pronósticos</th>
                </tr>
              </thead>
              <tbody>
                @for (e of entries; track e.idPartido; let i = $index) {
                  <tr>
                    <td class="col-num">{{ i + 1 }}</td>
                    <td class="col-match">{{ e.seleccionLocal }} vs {{ e.seleccionVisitante }}</td>
                    <td class="col-date">{{ e.fechaHora | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td><span class="badge-fase">{{ e.fase }}</span></td>
                    <td class="col-num col-count">{{ e.totalPronosticos }}</td>
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
    .filter-group select { min-width: 160px; }
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
    .col-num { text-align: center; width: 60px; font-weight: 600; color: var(--gray-500); }
    .col-match { font-weight: 600; color: var(--gray-900); }
    .col-date { color: var(--gray-500); font-size: 0.8rem; white-space: nowrap; }
    .col-count { font-weight: 700; color: var(--primary-dark); font-size: 1rem; }
    .badge-fase {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      font-size: 0.7rem;
      font-weight: 700;
      border-radius: var(--radius-sm);
      background: #dbeafe;
      color: #1e40af;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
  `]
})
export class ReportesComponent {
  private readonly reportesService = inject(ReportesService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly reporte = signal<PartidoMasApostado[] | null>(null);

  faseFiltro = '';
  fechaInicio = '';
  fechaFin = '';

  generar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.reporte.set(null);

    this.reportesService.obtenerPartidosMasApostados(
      this.faseFiltro || undefined,
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
    this.reportesService.exportarPartidosMasApostadosCsv(
      this.faseFiltro || undefined,
      this.fechaInicio ? `${this.fechaInicio}T00:00:00Z` : undefined,
      this.fechaFin ? `${this.fechaFin}T23:59:59Z` : undefined
    ).subscribe({
      next: csv => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-partidos-mas-apostados.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.error.set('Error al exportar el reporte.');
      }
    });
  }
}
