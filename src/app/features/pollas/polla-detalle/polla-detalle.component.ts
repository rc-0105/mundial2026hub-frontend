import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { PollasService } from '../../../core/services/pollas.service';
import { PollaSummary, RankingEntry, MiPronostico } from '../../../core/models/polla.model';

@Component({
  selector: 'app-polla-detalle',
  imports: [RouterLink, DatePipe],
  template: `
    <div class="page-container">

      <a routerLink="/pollas" class="btn-back">← Volver a mis pollas</a>

      @if (loading()) {
        <div class="loading" style="margin-top:2rem;">Cargando polla...</div>
      } @else if (error()) {
        <div class="error" style="margin-top:2rem;">{{ error() }}</div>
      } @else {
        <!-- Header -->
        <div class="polla-header">
          <div class="polla-header-info">
            <h1>{{ polla()?.nombre }}</h1>
            <div class="header-meta">
              <span class="estado-badge" [class.activa]="polla()?.estado === 'ACTIVA'" [class.fin]="polla()?.estado === 'FINALIZADA'">
                {{ polla()?.estado === 'ACTIVA' ? 'Activa' : 'Finalizada' }}
              </span>
              <span class="code-chip">{{ polla()?.codigoInvitacion }}</span>
              <button class="btn-copy-small" (click)="copiarEnlace()" [title]="'Copiar enlace de invitación'">
                {{ enlaceCopiado() ? '✓ Copiado' : 'Copiar enlace' }}
              </button>
            </div>
          </div>
          <div class="polla-header-fecha">
            Creada el {{ polla()?.fechaCreacion | date:'dd/MM/yyyy' }}
          </div>
        </div>

        <div class="detalle-grid">

          <!-- RANKING -->
          <section class="section-card">
            <h2 class="section-title">Ranking</h2>

            @if (ranking().length === 0) {
              <div class="empty-section">
                <p>Aún no hay participantes con puntos.</p>
                <p class="hint">Los puntos se acumulan a medida que los partidos finalizan.</p>
              </div>
            } @else {
              <div class="ranking-table">
                <div class="ranking-header">
                  <span class="col-pos">#</span>
                  <span class="col-name">Participante</span>
                  <span class="col-pts">Puntos</span>
                  <span class="col-prize">Premio</span>
                </div>
                @for (r of ranking(); track r.posicion) {
                  <div class="ranking-row"
                    [class.gold]="r.posicion === 1"
                    [class.silver]="r.posicion === 2"
                    [class.bronze]="r.posicion === 3">
                    <span class="col-pos">
                      @if (r.posicion === 1) { 🥇 }
                      @else if (r.posicion === 2) { 🥈 }
                      @else if (r.posicion === 3) { 🥉 }
                      @else { {{ r.posicion }} }
                    </span>
                    <span class="col-name">{{ r.nombre }}</span>
                    <span class="col-pts">{{ r.puntaje }} pts</span>
                    <span class="col-prize">{{ r.premioDigital ?? '—' }}</span>
                  </div>
                }
              </div>
            }
          </section>

          <!-- MIS APUESTAS -->
          <section class="section-card">
            <h2 class="section-title">Mis apuestas</h2>

            @if (misPronosticos().length === 0) {
              <div class="empty-section">
                <p>No hiciste ninguna apuesta en esta polla todavía.</p>
                @if (polla()?.estado === 'ACTIVA') {
                  <p class="hint">Podés agregar apuestas desde la lista de partidos.</p>
                }
              </div>
            } @else {
              <div class="pronosticos-list">
                @for (p of misPronosticos(); track p.idPronostico) {
                  <div class="pronostico-card" [class.cerrado]="p.periodoCerrado">
                    <div class="pronostico-header">
                      <span class="fase-tag">{{ labelFase(p.partido.fase) }}</span>
                      <span class="fecha-tag">{{ p.partido.fechaHora | date:'dd MMM · HH:mm' }}</span>
                      @if (p.periodoCerrado) {
                        <span class="closed-badge">Cerrado</span>
                      }
                    </div>

                    <div class="pronostico-match">
                      <span class="match-team" [class.winner]="p.ganadorPronosticado === 'LOCAL'">
                        {{ p.partido.seleccionLocal }}
                      </span>
                      <div class="pronostico-score-block">
                        <div class="pronostico-score">{{ p.golesLocal }} - {{ p.golesVisitante }}</div>
                        <div class="pronostico-result-label">{{ labelGanador(p.ganadorPronosticado) }}</div>
                      </div>
                      <span class="match-team match-team-right" [class.winner]="p.ganadorPronosticado === 'VISITANTE'">
                        {{ p.partido.seleccionVisitante }}
                      </span>
                    </div>

                    @if (p.partido.estado === 'FINALIZADO') {
                      <div class="resultado-real">
                        <span class="resultado-label">Resultado real:</span>
                        <span class="resultado-score">
                          {{ p.partido.golesLocal }} - {{ p.partido.golesVisitante }}
                        </span>
                        <span class="resultado-chip" [class.acertado]="acerto(p)" [class.fallado]="!acerto(p)">
                          {{ acerto(p) ? '✓ Acertaste' : '✗ Fallaste' }}
                        </span>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </section>

        </div>
      }
    </div>
  `,
  styles: [`
    .btn-back { display: inline-block; color: var(--gray-500); font-size: 0.85rem; text-decoration: none; margin-bottom: 1.5rem; transition: color 0.15s; }
    .btn-back:hover { color: var(--gray-900); }

    .polla-header { margin-bottom: 2rem; }
    .polla-header-info { display: flex; align-items: flex-start; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
    .polla-header-info h1 { font-size: 1.5rem; font-weight: 800; margin: 0; }
    .header-meta { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .polla-header-fecha { font-size: 0.78rem; color: var(--gray-400); }

    .estado-badge { padding: 0.15rem 0.6rem; border-radius: var(--radius-sm); font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
    .estado-badge.activa { background: #dcfce7; color: #15803d; }
    .estado-badge.fin { background: var(--gray-100); color: var(--gray-500); }

    .code-chip { font-family: 'Courier New', monospace; font-size: 0.9rem; font-weight: 800; color: var(--primary-dark); background: var(--primary-light); padding: 0.15rem 0.6rem; border-radius: var(--radius-sm); letter-spacing: 0.08em; }

    .btn-copy-small { padding: 0.2rem 0.65rem; background: transparent; color: var(--primary); border: 1px solid var(--primary); border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
    .btn-copy-small:hover { background: var(--primary-light); }

    .detalle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: start; }
    @media (max-width: 768px) { .detalle-grid { grid-template-columns: 1fr; } }

    .section-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; }
    .section-title { font-size: 1rem; font-weight: 700; color: var(--gray-900); margin: 0 0 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }

    .empty-section { text-align: center; padding: 1.5rem; color: var(--gray-500); font-size: 0.875rem; }
    .empty-section .hint { font-size: 0.78rem; color: var(--gray-400); margin-top: 0.5rem; }

    /* Ranking */
    .ranking-table { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
    .ranking-header { display: grid; grid-template-columns: 2.5rem 1fr 4.5rem 5rem; gap: 0.5rem; padding: 0.6rem 0.75rem; background: var(--gray-50); font-size: 0.7rem; font-weight: 700; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.05em; }
    .ranking-row { display: grid; grid-template-columns: 2.5rem 1fr 4.5rem 5rem; gap: 0.5rem; padding: 0.65rem 0.75rem; align-items: center; border-top: 1px solid var(--border); font-size: 0.85rem; transition: background 0.1s; }
    .ranking-row:hover { background: var(--gray-50); }
    .ranking-row.gold { background: #fffbeb; }
    .ranking-row.silver { background: #f8fafc; }
    .ranking-row.bronze { background: #fff7ed; }
    .col-pos { text-align: center; font-weight: 700; font-size: 0.9rem; }
    .col-name { font-weight: 600; color: var(--gray-900); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .col-pts { font-weight: 700; color: var(--primary-dark); text-align: center; }
    .col-prize { font-size: 0.72rem; color: var(--gray-500); text-align: center; }

    /* Mis pronosticos */
    .pronosticos-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .pronostico-card { border: 1px solid var(--border); border-radius: var(--radius); padding: 0.85rem; transition: border-color 0.15s; }
    .pronostico-card.cerrado { opacity: 0.8; }

    .pronostico-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem; flex-wrap: wrap; }
    .fase-tag { font-size: 0.68rem; font-weight: 700; background: var(--primary-light); color: var(--primary-dark); padding: 0.1rem 0.45rem; border-radius: var(--radius-sm); text-transform: uppercase; letter-spacing: 0.04em; }
    .fecha-tag { font-size: 0.72rem; color: var(--gray-400); }
    .closed-badge { margin-left: auto; font-size: 0.68rem; font-weight: 700; background: var(--gray-100); color: var(--gray-500); padding: 0.1rem 0.45rem; border-radius: var(--radius-sm); }

    .pronostico-match { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
    .match-team { flex: 1; font-weight: 600; font-size: 0.82rem; color: var(--gray-700); }
    .match-team-right { text-align: right; }
    .match-team.winner { color: var(--primary-dark); font-weight: 800; }

    .pronostico-score-block { text-align: center; flex-shrink: 0; }
    .pronostico-score { font-size: 1rem; font-weight: 800; color: var(--gray-900); }
    .pronostico-result-label { font-size: 0.65rem; color: var(--gray-400); margin-top: 0.1rem; }

    .resultado-real { display: flex; align-items: center; gap: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed var(--border); font-size: 0.78rem; flex-wrap: wrap; }
    .resultado-label { color: var(--gray-400); }
    .resultado-score { font-weight: 700; color: var(--gray-800); }
    .resultado-chip { padding: 0.1rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.72rem; font-weight: 700; }
    .resultado-chip.acertado { background: #dcfce7; color: #15803d; }
    .resultado-chip.fallado { background: #fee2e2; color: #dc2626; }
  `]
})
export class PollaDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly pollasService = inject(PollasService);

  readonly polla = signal<PollaSummary | null>(null);
  readonly ranking = signal<RankingEntry[]>([]);
  readonly misPronosticos = signal<MiPronostico[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly enlaceCopiado = signal(false);

  ngOnInit(): void {
    const idPolla = Number(this.route.snapshot.paramMap.get('id'));

    forkJoin({
      polla: this.pollasService.getPolla(idPolla),
      ranking: this.pollasService.obtenerRanking(idPolla),
      pronosticos: this.pollasService.getMisPronosticos(idPolla),
    }).subscribe({
      next: ({ polla, ranking, pronosticos }) => {
        this.polla.set(polla.data);
        this.ranking.set(ranking.data);
        this.misPronosticos.set(pronosticos.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la polla. Verificá que tenés acceso.');
        this.loading.set(false);
      }
    });
  }

  copiarEnlace(): void {
    const url = this.polla()?.enlaceInvitacion;
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      this.enlaceCopiado.set(true);
      setTimeout(() => this.enlaceCopiado.set(false), 2000);
    });
  }

  acerto(p: MiPronostico): boolean {
    if (p.partido.estado !== 'FINALIZADO') return false;
    const golesL = p.partido.golesLocal ?? 0;
    const golesV = p.partido.golesVisitante ?? 0;
    const realGanador = golesL > golesV ? 'LOCAL' : golesV > golesL ? 'VISITANTE' : 'EMPATE';
    return p.ganadorPronosticado === realGanador;
  }

  labelFase(fase: string): string {
    const labels: Record<string, string> = {
      GRUPOS: 'Grupos', OCTAVOS: 'Octavos', CUARTOS: 'Cuartos',
      SEMIFINAL: 'Semi', TERCER_PUESTO: '3er puesto', FINAL: 'Final',
    };
    return labels[fase] || fase;
  }

  labelGanador(g: string): string {
    if (g === 'LOCAL') return 'Gana local';
    if (g === 'VISITANTE') return 'Gana visitante';
    return 'Empate';
  }
}
