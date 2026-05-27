import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportesService, ReporteAdopcion, RankingGeneralEntry } from '../../core/services/reportes.service';

@Component({
  selector: 'app-reportes',
  imports: [FormsModule],
  template: `
    <div class="page-container">
      <h1>Reportes</h1>
      <p class="subtitle">Estadísticas y exportación de datos de la plataforma</p>

      <!-- Adopción de pollas -->
      <div class="report-card">
        <h2>Adopción de pollas</h2>
        <p class="section-desc">Comparación de usuarios que participan en pollas vs total de usuarios registrados.</p>

        <div class="filter-row">
          <div class="filter-group">
            <label for="adopcionInicio">Fecha inicio</label>
            <input id="adopcionInicio" type="date" [(ngModel)]="adopcionFechaInicio" />
          </div>
          <div class="filter-group">
            <label for="adopcionFin">Fecha fin</label>
            <input id="adopcionFin" type="date" [(ngModel)]="adopcionFechaFin" />
          </div>
          <div class="filter-actions">
            <button class="btn-primary" (click)="generarAdopcion()" [disabled]="adopcionLoading()">
              @if (adopcionLoading()) { Generando... } @else { Generar reporte }
            </button>
            <button class="btn-outline" (click)="exportarAdopcionCsv()" [disabled]="!adopcionReporte()">
              Exportar CSV
            </button>
          </div>
        </div>

        @if (adopcionError()) {
          <div class="error">{{ adopcionError() }}</div>
        }

        @if (adopcionReporte(); as r) {
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

      <!-- Ranking general -->
      <div class="report-card">
        <h2>Ranking general de pollas</h2>
        <p class="section-desc">
          Ranking consolidado de todos los usuarios con su puntaje total acumulado en todas las pollas.
        </p>

        <div class="filter-row">
          <div class="filter-group">
            <label for="idPolla">Filtrar por polla (ID)</label>
            <input id="idPolla" type="number" placeholder="Dejar vacío para todas" [(ngModel)]="rankingIdPolla" min="1" />
          </div>
          <div class="filter-actions">
            <button class="btn-primary" (click)="generarRanking()" [disabled]="rankingLoading()">
              @if (rankingLoading()) { Generando... } @else { Generar reporte }
            </button>
            <button class="btn-outline" (click)="exportarRankingCsv()" [disabled]="!ranking()">
              Exportar CSV
            </button>
          </div>
        </div>

        @if (rankingError()) {
          <div class="error">{{ rankingError() }}</div>
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
                      @if (i === 0) { <span class="medal">🥇</span> }
                      @else if (i === 1) { <span class="medal">🥈</span> }
                      @else if (i === 2) { <span class="medal">🥉</span> }
                      @else { {{ i + 1 }} }
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
    .stat-highlight { background: var(--primary-light); border-color: var(--primary); }
    .stat-value { font-size: 2rem; font-weight: 800; color: var(--gray-900); line-height: 1.2; }
    .stat-highlight .stat-value { color: var(--primary-dark); }
    .stat-label { font-size: 0.75rem; color: var(--gray-500); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 0.3rem; }
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

  readonly adopcionLoading = signal(false);
  readonly adopcionError = signal<string | null>(null);
  readonly adopcionReporte = signal<ReporteAdopcion | null>(null);
  adopcionFechaInicio = '';
  adopcionFechaFin = '';

  readonly rankingLoading = signal(false);
  readonly rankingError = signal<string | null>(null);
  readonly ranking = signal<RankingGeneralEntry[] | null>(null);
  rankingIdPolla = '';

  generarAdopcion(): void {
    this.adopcionLoading.set(true);
    this.adopcionError.set(null);
    this.adopcionReporte.set(null);

    this.reportesService.obtenerAdopcion(
      this.adopcionFechaInicio ? `${this.adopcionFechaInicio}T00:00:00Z` : undefined,
      this.adopcionFechaFin ? `${this.adopcionFechaFin}T23:59:59Z` : undefined
    ).subscribe({
      next: res => { this.adopcionReporte.set(res.data); this.adopcionLoading.set(false); },
      error: () => { this.adopcionError.set('Error al generar el reporte.'); this.adopcionLoading.set(false); }
    });
  }

  exportarAdopcionCsv(): void {
    this.reportesService.exportarAdopcionCsv(
      this.adopcionFechaInicio ? `${this.adopcionFechaInicio}T00:00:00Z` : undefined,
      this.adopcionFechaFin ? `${this.adopcionFechaFin}T23:59:59Z` : undefined
    ).subscribe({
      next: csv => this.descargarCsv(csv, 'reporte-adopcion.csv'),
      error: () => this.adopcionError.set('Error al exportar el reporte.')
    });
  }

  generarRanking(): void {
    this.rankingLoading.set(true);
    this.rankingError.set(null);
    this.ranking.set(null);

    const idPolla = this.rankingIdPolla ? Number(this.rankingIdPolla) : undefined;
    this.reportesService.obtenerRankingGeneral(idPolla).subscribe({
      next: res => { this.ranking.set(res.data); this.rankingLoading.set(false); },
      error: () => { this.rankingError.set('Error al generar el reporte.'); this.rankingLoading.set(false); }
    });
  }

  exportarRankingCsv(): void {
    const idPolla = this.rankingIdPolla ? Number(this.rankingIdPolla) : undefined;
    this.reportesService.exportarRankingGeneralCsv(idPolla).subscribe({
      next: csv => this.descargarCsv(csv, 'reporte-ranking-general.csv'),
      error: () => this.rankingError.set('Error al exportar el reporte.')
    });
  }

  private descargarCsv(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
