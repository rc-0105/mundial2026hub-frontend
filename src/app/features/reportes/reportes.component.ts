import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportesService, RankingGeneralEntry } from '../../core/services/reportes.service';

@Component({
  selector: 'app-reportes',
  imports: [FormsModule],
  template: `
    <div class="page-container">
      <h1>Reportes</h1>
      <p class="subtitle">Estadísticas y exportación de datos de la plataforma</p>

      <div class="report-card">
        <h2>Ranking general de pollas</h2>
        <p class="section-desc">
          Ranking consolidado de todos los usuarios con su puntaje total acumulado en todas las pollas en las que han participado.
        </p>

        <div class="filter-row">
          <div class="filter-group">
            <label for="idPolla">Filtrar por polla (ID)</label>
            <input
              id="idPolla"
              type="number"
              placeholder="Dejar vacío para todas"
              [(ngModel)]="idPollaFiltro"
              min="1"
            />
          </div>
          <div class="filter-actions">
            <button class="btn-primary" (click)="generar()" [disabled]="loading()">
              @if (loading()) {
                Generando...
              } @else {
                Generar reporte
              }
            </button>
            <button class="btn-outline" (click)="exportarCsv()" [disabled]="!ranking()">
              Exportar CSV
            </button>
          </div>
        </div>

        @if (error()) {
          <div class="error">{{ error() }}</div>
        }

        @if (ranking(); as entries) {
          @if (entries.length === 0) {
            <div class="empty-state">No hay datos de ranking disponibles.</div>
          } @else {
            <table class="ranking-table">
              <thead>
                <tr>
                  <th class="col-pos">#</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th class="col-num">Puntaje total</th>
                  <th class="col-num">Pollas participadas</th>
                </tr>
              </thead>
              <tbody>
                @for (e of entries; track e.idUsuario; let i = $index) {
                  <tr>
                    <td class="col-pos">
                      @if (i === 0) {
                        <span class="medal">🥇</span>
                      } @else if (i === 1) {
                        <span class="medal">🥈</span>
                      } @else if (i === 2) {
                        <span class="medal">🥉</span>
                      } @else {
                        {{ i + 1 }}
                      }
                    </td>
                    <td class="col-name">{{ e.nombre }}</td>
                    <td class="col-email">{{ e.correo }}</td>
                    <td class="col-num">{{ e.puntajeTotalAcumulado }}</td>
                    <td class="col-num">{{ e.cantidadPollasParticipadas }}</td>
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
      max-width: 800px;
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
      width: 180px;
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
    .empty-state {
      margin-top: 1.5rem;
      padding: 2rem;
      text-align: center;
      color: var(--gray-400);
      background: var(--gray-50);
      border-radius: var(--radius);
      border: 1px dashed var(--border);
    }
    .ranking-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1.25rem;
      animation: fadeIn 0.4s ease;
    }
    .ranking-table th {
      text-align: left;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--gray-400);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0.6rem 0.5rem;
      border-bottom: 2px solid var(--border);
    }
    .ranking-table td {
      padding: 0.7rem 0.5rem;
      font-size: 0.85rem;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    .ranking-table tbody tr:hover { background: var(--gray-50); }
    .col-pos { width: 50px; text-align: center; font-weight: 700; color: var(--gray-500); }
    .col-name { font-weight: 600; color: var(--gray-900); }
    .col-email { color: var(--gray-500); font-size: 0.8rem; }
    .col-num { text-align: center; font-weight: 600; color: var(--gray-700); width: 120px; }
    .medal { font-size: 1.2rem; }
  `]
})
export class ReportesComponent {
  private readonly reportesService = inject(ReportesService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly ranking = signal<RankingGeneralEntry[] | null>(null);

  idPollaFiltro = '';

  generar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.ranking.set(null);

    const idPolla = this.idPollaFiltro ? Number(this.idPollaFiltro) : undefined;

    this.reportesService.obtenerRankingGeneral(idPolla).subscribe({
      next: res => {
        this.ranking.set(res.data);
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

    this.reportesService.exportarRankingGeneralCsv(idPolla).subscribe({
      next: csv => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-ranking-general.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.error.set('Error al exportar el reporte.');
      }
    });
  }
}
