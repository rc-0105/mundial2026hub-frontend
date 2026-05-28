import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ReportesService, ReporteAdopcion, RankingGeneralEntry, PartidoMasApostado, AciertosUsuario, ActividadPeriodo } from '../../core/services/reportes.service';

@Component({
  selector: 'app-reportes',
  imports: [FormsModule, DatePipe],
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
            <button class="btn-outline" (click)="exportarAdopcionCsv()" [disabled]="!adopcionReporte()">Exportar CSV</button>
          </div>
        </div>
        @if (adopcionError()) { <div class="error">{{ adopcionError() }}</div> }
        @if (adopcionReporte(); as r) {
          <div class="stats-grid">
            <div class="stat-card"><div class="stat-value">{{ r.totalUsuariosRegistrados }}</div><div class="stat-label">Usuarios registrados</div></div>
            <div class="stat-card"><div class="stat-value">{{ r.totalUsuariosApostadores }}</div><div class="stat-label">Usuarios que apostaron</div></div>
            <div class="stat-card stat-highlight"><div class="stat-value">{{ r.porcentajeParticipacion }}%</div><div class="stat-label">Participación</div></div>
          </div>
        }
      </div>

      <!-- Ranking general -->
      <div class="report-card">
        <h2>Ranking general de pollas</h2>
        <p class="section-desc">Ranking consolidado con puntaje total acumulado en todas las pollas.</p>
        <div class="filter-row">
          <div class="filter-group">
            <label for="idPollaRanking">Filtrar por polla (ID)</label>
            <input id="idPollaRanking" type="number" placeholder="Dejar vacío para todas" [(ngModel)]="rankingIdPolla" min="1" />
          </div>
          <div class="filter-actions">
            <button class="btn-primary" (click)="generarRanking()" [disabled]="rankingLoading()">
              @if (rankingLoading()) { Generando... } @else { Generar reporte }
            </button>
            <button class="btn-outline" (click)="exportarRankingCsv()" [disabled]="!ranking()">Exportar CSV</button>
          </div>
        </div>
        @if (rankingError()) { <div class="error">{{ rankingError() }}</div> }
        @if (ranking(); as entries) {
          @if (entries.length === 0) {
            <div class="empty-state">No hay datos de ranking disponibles.</div>
          } @else {
            <table class="report-table">
              <thead><tr><th class="col-pos">#</th><th>Nombre</th><th>Correo</th><th class="col-num">Puntaje total</th><th class="col-num">Pollas</th></tr></thead>
              <tbody>
                @for (e of entries; track e.idUsuario; let i = $index) {
                  <tr>
                    <td class="col-pos">
                      <span class="pos-badge" [class.pos-1]="i===0" [class.pos-2]="i===1" [class.pos-3]="i===2">{{ i + 1 }}</span>
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

      <!-- Partidos más apostados -->
      <div class="report-card">
        <h2>Partidos más apostados</h2>
        <p class="section-desc">Partidos ordenados por cantidad de pronósticos recibidos.</p>
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
            <label for="partidosInicio">Fecha inicio</label>
            <input id="partidosInicio" type="date" [(ngModel)]="partidosFechaInicio" />
          </div>
          <div class="filter-group">
            <label for="partidosFin">Fecha fin</label>
            <input id="partidosFin" type="date" [(ngModel)]="partidosFechaFin" />
          </div>
          <div class="filter-actions">
            <button class="btn-primary" (click)="generarPartidos()" [disabled]="partidosLoading()">
              @if (partidosLoading()) { Generando... } @else { Generar reporte }
            </button>
            <button class="btn-outline" (click)="exportarPartidosCsv()" [disabled]="!partidos()">Exportar CSV</button>
          </div>
        </div>
        @if (partidosError()) { <div class="error">{{ partidosError() }}</div> }
        @if (partidos(); as entries) {
          @if (entries.length === 0) {
            <div class="empty-state">No hay partidos con pronósticos registrados.</div>
          } @else {
            <table class="report-table">
              <thead><tr><th class="col-num">#</th><th>Partido</th><th>Fecha</th><th>Fase</th><th class="col-num">Pronósticos</th></tr></thead>
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

      <!-- Predicciones acertadas -->
      <div class="report-card">
        <h2>Predicciones acertadas por usuario</h2>
        <p class="section-desc">Porcentaje de aciertos de cada usuario, ordenado de mayor a menor precisión.</p>
        <div class="filter-row">
          <div class="filter-group">
            <label for="idPollaAciertos">Filtrar por polla (ID)</label>
            <input id="idPollaAciertos" type="number" placeholder="Todas las pollas" [(ngModel)]="aciertosIdPolla" min="1" />
          </div>
          <div class="filter-group">
            <label for="aciertosInicio">Fecha inicio</label>
            <input id="aciertosInicio" type="date" [(ngModel)]="aciertosFechaInicio" />
          </div>
          <div class="filter-group">
            <label for="aciertosFin">Fecha fin</label>
            <input id="aciertosFin" type="date" [(ngModel)]="aciertosFechaFin" />
          </div>
          <div class="filter-actions">
            <button class="btn-primary" (click)="generarAciertos()" [disabled]="aciertosLoading()">
              @if (aciertosLoading()) { Generando... } @else { Generar reporte }
            </button>
            <button class="btn-outline" (click)="exportarAciertosCsv()" [disabled]="!aciertos()">Exportar CSV</button>
          </div>
        </div>
        @if (aciertosError()) { <div class="error">{{ aciertosError() }}</div> }
        @if (aciertos(); as entries) {
          @if (entries.length === 0) {
            <div class="empty-state">No hay datos de aciertos disponibles.</div>
          } @else {
            <div class="aciertos-summary">
              <div class="summary-item"><span class="summary-value">{{ entries.length }}</span><span class="summary-label">Usuarios</span></div>
              <div class="summary-item"><span class="summary-value">{{ totalPronosticos() }}</span><span class="summary-label">Pronósticos totales</span></div>
              <div class="summary-item"><span class="summary-value">{{ totalAciertosResultado() }}</span><span class="summary-label">Aciertos resultado</span></div>
              <div class="summary-item"><span class="summary-value">{{ totalAciertosExacto() }}</span><span class="summary-label">Marcadores exactos</span></div>
            </div>
            <table class="report-table">
              <thead><tr><th class="col-pos">#</th><th>Nombre</th><th class="col-num">Pronósticos</th><th class="col-num">Aciertos</th><th class="col-num">Exactos</th><th class="col-pct">% Acierto</th></tr></thead>
              <tbody>
                @for (e of entries; track e.idUsuario; let i = $index) {
                  <tr>
                    <td class="col-pos">{{ i + 1 }}</td>
                    <td class="col-name">{{ e.nombre }}</td>
                    <td class="col-num">{{ e.totalPronosticosRegistrados }}</td>
                    <td class="col-num">{{ e.pronosticosAcertadosResultado }}</td>
                    <td class="col-num">{{ e.pronosticosAcertadosMarcadorExacto }}</td>
                    <td class="col-pct"><span class="pct-badge" [style.background]="pctColor(e.porcentajeAcierto)">{{ e.porcentajeAcierto }}%</span></td>
                  </tr>
                }
              </tbody>
            </table>
          }
        }
      </div>

      <!-- Actividad por período -->
      <div class="report-card">
        <h2>Actividad por período</h2>
        <p class="section-desc">Nuevos usuarios, sesiones, pollas creadas y pronósticos registrados, agrupados por semana o mes.</p>
        <div class="filter-row">
          <div class="filter-group">
            <label for="granularidad">Agrupar por</label>
            <select id="granularidad" [(ngModel)]="granularidad">
              <option value="mensual">Mensual</option>
              <option value="semanal">Semanal</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="actividadInicio">Fecha inicio</label>
            <input id="actividadInicio" type="date" [(ngModel)]="actividadFechaInicio" />
          </div>
          <div class="filter-group">
            <label for="actividadFin">Fecha fin</label>
            <input id="actividadFin" type="date" [(ngModel)]="actividadFechaFin" />
          </div>
          <div class="filter-actions">
            <button class="btn-primary" (click)="generarActividad()" [disabled]="actividadLoading()">
              @if (actividadLoading()) { Generando... } @else { Generar reporte }
            </button>
            <button class="btn-outline" (click)="exportarActividadCsv()" [disabled]="!actividad()">Exportar CSV</button>
          </div>
        </div>
        @if (actividadError()) { <div class="error">{{ actividadError() }}</div> }
        @if (actividad(); as entries) {
          @if (entries.length === 0) {
            <div class="empty-state">No hay datos de actividad para el período seleccionado.</div>
          } @else {
            <div class="actividad-chart">
              @for (e of entries; track e.periodo) {
                <div class="periodo-bar">
                  <div class="periodo-label">{{ formatPeriodo(e.periodo) }}</div>
                  <div class="bar-row">
                    <div class="bar-item">
                      <div class="bar bar-users" [style.width.%]="barWidth(e.nuevosUsuariosRegistrados, entries, 'nuevosUsuariosRegistrados')"></div>
                      <span class="bar-value">{{ e.nuevosUsuariosRegistrados }}</span>
                    </div>
                    <div class="bar-item">
                      <div class="bar bar-sesiones" [style.width.%]="barWidth(e.sesionesIniciadas, entries, 'sesionesIniciadas')"></div>
                      <span class="bar-value">{{ e.sesionesIniciadas }}</span>
                    </div>
                    <div class="bar-item">
                      <div class="bar bar-pollas" [style.width.%]="barWidth(e.pollasCreadas, entries, 'pollasCreadas')"></div>
                      <span class="bar-value">{{ e.pollasCreadas }}</span>
                    </div>
                    <div class="bar-item">
                      <div class="bar bar-pronosticos" [style.width.%]="barWidth(e.pronosticosRegistrados, entries, 'pronosticosRegistrados')"></div>
                      <span class="bar-value">{{ e.pronosticosRegistrados }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
            <table class="report-table">
              <thead><tr><th>Período</th><th class="col-num">Nuevos usuarios</th><th class="col-num">Sesiones</th><th class="col-num">Pollas creadas</th><th class="col-num">Pronósticos</th></tr></thead>
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
    .filter-group input, .filter-group select {
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
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1.5rem; animation: fadeIn 0.4s ease; }
    .stat-card { text-align: center; padding: 1.5rem 1rem; background: var(--gray-50); border: 1px solid var(--border); border-radius: var(--radius); }
    .stat-highlight { background: var(--primary-light); border-color: var(--primary); }
    .stat-value { font-size: 2rem; font-weight: 800; color: var(--gray-900); line-height: 1.2; }
    .stat-highlight .stat-value { color: var(--primary-dark); }
    .stat-label { font-size: 0.75rem; color: var(--gray-500); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 0.3rem; }
    .empty-state { margin-top: 1.5rem; padding: 2rem; text-align: center; color: var(--gray-400); background: var(--gray-50); border-radius: var(--radius); border: 1px dashed var(--border); }
    .report-table { width: 100%; border-collapse: collapse; margin-top: 1.25rem; animation: fadeIn 0.4s ease; }
    .report-table th { text-align: left; font-size: 0.7rem; font-weight: 700; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.06em; padding: 0.6rem 0.5rem; border-bottom: 2px solid var(--border); }
    .report-table td { padding: 0.7rem 0.5rem; font-size: 0.85rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .report-table tbody tr:hover { background: var(--gray-50); }
    .col-pos { width: 50px; text-align: center; font-weight: 700; color: var(--gray-500); }
    .col-name { font-weight: 600; color: var(--gray-900); }
    .col-email { color: var(--gray-500); font-size: 0.8rem; }
    .col-num { text-align: center; font-weight: 600; color: var(--gray-700); width: 120px; }
    .col-match { font-weight: 600; color: var(--gray-900); }
    .col-date { white-space: nowrap; color: var(--gray-500); font-size: 0.8rem; }
    .col-count { color: var(--primary-dark); }
    .col-pct { text-align: center; width: 100px; }
    .col-periodo { font-weight: 600; color: var(--gray-800); }
    .pos-badge {
      display: inline-flex; align-items: center; justify-content: center;
      width: 1.75rem; height: 1.75rem; border-radius: 50%;
      font-size: 0.72rem; font-weight: 800;
      background: var(--gray-200); color: var(--gray-600);
    }
    .pos-badge.pos-1 { background: linear-gradient(135deg, #fbbf24, #d97706); color: white; }
    .pos-badge.pos-2 { background: linear-gradient(135deg, #cbd5e1, #94a3b8); color: white; }
    .pos-badge.pos-3 { background: linear-gradient(135deg, #fdba74, #ea580c); color: white; }
    .badge-fase { display: inline-block; padding: 0.15rem 0.5rem; font-size: 0.7rem; font-weight: 700; border-radius: var(--radius-sm); background: #dbeafe; color: #1e40af; text-transform: uppercase; letter-spacing: 0.04em; }
    .aciertos-summary { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: 1rem; padding: 1rem; background: var(--gray-50); border-radius: var(--radius); }
    .summary-item { display: flex; flex-direction: column; align-items: center; }
    .summary-value { font-size: 1.5rem; font-weight: 800; color: var(--gray-900); }
    .summary-label { font-size: 0.7rem; color: var(--gray-400); font-weight: 600; text-transform: uppercase; }
    .pct-badge { display: inline-block; padding: 0.2rem 0.5rem; font-size: 0.75rem; font-weight: 700; border-radius: var(--radius-sm); color: white; }
    .actividad-chart { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem; }
    .periodo-bar { display: flex; align-items: center; gap: 1rem; }
    .periodo-label { font-size: 0.75rem; font-weight: 600; color: var(--gray-600); width: 90px; flex-shrink: 0; }
    .bar-row { flex: 1; display: flex; flex-direction: column; gap: 3px; }
    .bar-item { display: flex; align-items: center; gap: 0.5rem; }
    .bar { height: 8px; border-radius: 4px; min-width: 2px; transition: width 0.3s ease; }
    .bar-users { background: #3b82f6; }
    .bar-sesiones { background: #8b5cf6; }
    .bar-pollas { background: #10b981; }
    .bar-pronosticos { background: #f59e0b; }
    .bar-value { font-size: 0.7rem; color: var(--gray-500); font-weight: 600; min-width: 24px; }
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

  readonly partidosLoading = signal(false);
  readonly partidosError = signal<string | null>(null);
  readonly partidos = signal<PartidoMasApostado[] | null>(null);
  faseFiltro = '';
  partidosFechaInicio = '';
  partidosFechaFin = '';

  readonly aciertosLoading = signal(false);
  readonly aciertosError = signal<string | null>(null);
  readonly aciertos = signal<AciertosUsuario[] | null>(null);
  aciertosIdPolla = '';
  aciertosFechaInicio = '';
  aciertosFechaFin = '';

  readonly actividadLoading = signal(false);
  readonly actividadError = signal<string | null>(null);
  readonly actividad = signal<ActividadPeriodo[] | null>(null);
  granularidad = 'mensual';
  actividadFechaInicio = '';
  actividadFechaFin = '';

  readonly totalPronosticos = computed(() => this.aciertos()?.reduce((s, e) => s + e.totalPronosticosRegistrados, 0) ?? 0);
  readonly totalAciertosResultado = computed(() => this.aciertos()?.reduce((s, e) => s + e.pronosticosAcertadosResultado, 0) ?? 0);
  readonly totalAciertosExacto = computed(() => this.aciertos()?.reduce((s, e) => s + e.pronosticosAcertadosMarcadorExacto, 0) ?? 0);

  pctColor(pct: number): string {
    if (pct >= 70) return '#16a34a';
    if (pct >= 40) return '#ca8a04';
    return '#dc2626';
  }

  formatPeriodo(periodo: string): string {
    return periodo.replace('T', ' ').substring(0, 16);
  }

  barWidth(value: number, entries: ActividadPeriodo[], key: keyof ActividadPeriodo): number {
    const max = Math.max(...entries.map(e => Number(e[key])));
    return max === 0 ? 0 : Math.round((value / max) * 100);
  }

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
      error: () => this.adopcionError.set('Error al exportar.')
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
      error: () => this.rankingError.set('Error al exportar.')
    });
  }

  generarPartidos(): void {
    this.partidosLoading.set(true);
    this.partidosError.set(null);
    this.partidos.set(null);
    this.reportesService.obtenerPartidosMasApostados(
      this.faseFiltro || undefined,
      this.partidosFechaInicio ? `${this.partidosFechaInicio}T00:00:00Z` : undefined,
      this.partidosFechaFin ? `${this.partidosFechaFin}T23:59:59Z` : undefined
    ).subscribe({
      next: res => { this.partidos.set(res.data); this.partidosLoading.set(false); },
      error: () => { this.partidosError.set('Error al generar el reporte.'); this.partidosLoading.set(false); }
    });
  }

  exportarPartidosCsv(): void {
    this.reportesService.exportarPartidosMasApostadosCsv(
      this.faseFiltro || undefined,
      this.partidosFechaInicio ? `${this.partidosFechaInicio}T00:00:00Z` : undefined,
      this.partidosFechaFin ? `${this.partidosFechaFin}T23:59:59Z` : undefined
    ).subscribe({
      next: csv => this.descargarCsv(csv, 'reporte-partidos.csv'),
      error: () => this.partidosError.set('Error al exportar.')
    });
  }

  generarAciertos(): void {
    this.aciertosLoading.set(true);
    this.aciertosError.set(null);
    this.aciertos.set(null);
    const idPolla = this.aciertosIdPolla ? Number(this.aciertosIdPolla) : undefined;
    this.reportesService.obtenerAciertosUsuario(
      idPolla,
      this.aciertosFechaInicio ? `${this.aciertosFechaInicio}T00:00:00Z` : undefined,
      this.aciertosFechaFin ? `${this.aciertosFechaFin}T23:59:59Z` : undefined
    ).subscribe({
      next: res => { this.aciertos.set(res.data); this.aciertosLoading.set(false); },
      error: () => { this.aciertosError.set('Error al generar el reporte.'); this.aciertosLoading.set(false); }
    });
  }

  exportarAciertosCsv(): void {
    const idPolla = this.aciertosIdPolla ? Number(this.aciertosIdPolla) : undefined;
    this.reportesService.exportarAciertosCsv(
      idPolla,
      this.aciertosFechaInicio ? `${this.aciertosFechaInicio}T00:00:00Z` : undefined,
      this.aciertosFechaFin ? `${this.aciertosFechaFin}T23:59:59Z` : undefined
    ).subscribe({
      next: csv => this.descargarCsv(csv, 'reporte-aciertos.csv'),
      error: () => this.aciertosError.set('Error al exportar.')
    });
  }

  generarActividad(): void {
    this.actividadLoading.set(true);
    this.actividadError.set(null);
    this.actividad.set(null);
    this.reportesService.obtenerActividad(
      this.granularidad,
      this.actividadFechaInicio ? `${this.actividadFechaInicio}T00:00:00Z` : undefined,
      this.actividadFechaFin ? `${this.actividadFechaFin}T23:59:59Z` : undefined
    ).subscribe({
      next: res => { this.actividad.set(res.data); this.actividadLoading.set(false); },
      error: () => { this.actividadError.set('Error al generar el reporte.'); this.actividadLoading.set(false); }
    });
  }

  exportarActividadCsv(): void {
    this.reportesService.exportarActividadCsv(
      this.granularidad,
      this.actividadFechaInicio ? `${this.actividadFechaInicio}T00:00:00Z` : undefined,
      this.actividadFechaFin ? `${this.actividadFechaFin}T23:59:59Z` : undefined
    ).subscribe({
      next: csv => this.descargarCsv(csv, 'reporte-actividad.csv'),
      error: () => this.actividadError.set('Error al exportar.')
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
