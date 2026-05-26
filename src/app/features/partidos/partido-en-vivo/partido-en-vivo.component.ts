import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PartidosService } from '../../../core/services/partidos.service';
import { PartidoDetalle } from '../../../core/models/partido.model';

@Component({
  selector: 'app-partido-en-vivo',
  imports: [RouterLink, DatePipe],
  template: `
    <div class="page-container">
      <a [routerLink]="['/partidos', partido()?.idPartido]" style="display: inline-flex; align-items: center; gap: 0.4rem; margin-bottom: 1.5rem; color: var(--gray-500); font-size: 0.9rem; font-weight: 500;">
        ← Volver al detalle
      </a>

      @if (loading()) {
        <div class="loading">Cargando seguimiento en vivo</div>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
      } @else if (partido(); as p) {
        @if (staleData()) {
          <div class="stale-banner">Actualización pendiente. Mostrando último estado conocido.</div>
        }

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <div class="live-badge">
            <span class="live-dot"></span>
            EN VIVO
          </div>
          <span style="font-size: 0.8rem; color: var(--gray-400);">Última actualización: {{ lastUpdate() | date:'HH:mm:ss' }}</span>
        </div>

        <div class="live-hero">
          <div class="hero-teams">
            <div class="hero-team">
              <span class="hero-team-name">{{ p.seleccionLocal }}</span>
            </div>
            <div class="hero-score">
              <span class="hero-score-val">{{ p.golesLocal ?? 0 }}</span>
              <span class="hero-score-sep">-</span>
              <span class="hero-score-val">{{ p.golesVisitante ?? 0 }}</span>
            </div>
            <div class="hero-team hero-team-right">
              <span class="hero-team-name">{{ p.seleccionVisitante }}</span>
            </div>
          </div>
          <div class="hero-meta">
            <span class="hero-phase">{{ p.fase }}</span>
            <span>{{ p.estadio }}, {{ p.ciudad }}</span>
          </div>
        </div>

        @if ((p.eventos ?? []).length > 0) {
          <div class="live-section">
            <h2 class="section-title">Eventos del partido</h2>
            <div class="timeline">
              @for (e of (p.eventos ?? []); track e.idEvento) {
                <div class="tl-event" [class]="'tl-' + e.equipo.toLowerCase()">
                  <div class="tl-dot" [class]="'dot-' + e.tipo.toLowerCase()"></div>
                  <div class="tl-content">
                    <span class="tl-minute">{{ e.minuto }}'</span>
                    <span class="tl-player">{{ e.jugador }}</span>
                    <span class="tl-type" [class]="'type-' + e.tipo.toLowerCase()">{{ labelTipo(e.tipo) }}</span>
                    @if (e.descripcion) {
                      <span class="tl-desc">{{ e.descripcion }}</span>
                    }
                    <span class="tl-equipo">{{ e.equipo === 'LOCAL' ? p.seleccionLocal : p.seleccionVisitante }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        @if (p.posesionLocal != null && p.posesionVisitante != null) {
          <div class="live-section">
            <h2 class="section-title">Estadísticas en vivo</h2>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <span style="font-weight: 700; font-size: 1rem; min-width: 3rem; text-align: right;">{{ p.posesionLocal }}%</span>
              <div style="flex: 1; height: 10px; background: var(--gray-100); border-radius: 5px; overflow: hidden;">
                <div [style.width.%]="p.posesionLocal" style="height: 100%; background: var(--primary); border-radius: 5px;"></div>
              </div>
              <span style="font-size: 0.85rem; color: var(--gray-400); min-width: 4rem; text-align: center;">Posesión</span>
              <div style="flex: 1; height: 10px; background: var(--gray-100); border-radius: 5px; overflow: hidden;">
                <div [style.width.%]="p.posesionVisitante" style="height: 100%; background: #dc2626; border-radius: 5px; float: right;"></div>
              </div>
              <span style="font-weight: 700; font-size: 1rem; min-width: 3rem;">{{ p.posesionVisitante }}%</span>
            </div>
          </div>
        }

        <div style="text-align: center; font-size: 0.8rem; color: var(--gray-400); padding: 1rem;">
          Los eventos se actualizan automáticamente cada 30 segundos.
        </div>
      }
    </div>
  `,
  styles: [`
    .live-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: #dc2626; color: white; padding: 0.4rem 1.25rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3); }
    .live-dot { width: 8px; height: 8px; border-radius: 50%; background: white; animation: blink 1s infinite; }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
    .live-hero { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 2.5rem 2rem; margin-bottom: 1.5rem; box-shadow: var(--shadow); background: linear-gradient(135deg, var(--surface) 0%, #fef2f2 100%); }
    .hero-teams { display: flex; align-items: center; justify-content: center; gap: 2rem; margin-bottom: 1.25rem; }
    .hero-team { flex: 1; }
    .hero-team-right { text-align: left; }
    .hero-team:first-child { text-align: right; }
    .hero-team-name { font-weight: 800; font-size: 1.4rem; color: var(--gray-900); }
    .hero-score { display: flex; align-items: center; gap: 0.75rem; }
    .hero-score-val { font-size: 3.5rem; font-weight: 900; color: var(--gray-900); line-height: 1; }
    .hero-score-sep { font-size: 2.5rem; color: var(--gray-300); }
    .hero-meta { display: flex; justify-content: center; gap: 1.5rem; font-size: 0.85rem; color: var(--gray-400); flex-wrap: wrap; }
    .hero-phase { font-weight: 600; color: #dc2626; text-transform: uppercase; letter-spacing: 0.05em; }
    .live-section { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1rem; box-shadow: var(--shadow-sm); }
    .section-title { font-size: 1rem; font-weight: 600; color: var(--gray-900); margin: 0 0 1rem; }
    .timeline { display: flex; flex-direction: column; gap: 0; position: relative; padding-left: 1.5rem; }
    .timeline::before { content: ''; position: absolute; left: 7px; top: 8px; bottom: 8px; width: 2px; background: var(--gray-200); }
    .tl-event { display: flex; gap: 1rem; padding: 0.75rem 0; position: relative; }
    .tl-visitante { flex-direction: row-reverse; }
    .tl-visitante .tl-content { text-align: right; }
    .tl-dot { position: absolute; left: -1.15rem; top: 0.85rem; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; z-index: 1; background: var(--gray-300); }
    .dot-gol { background: #16a34a; }
    .dot-tarjeta_amarilla { background: #eab308; }
    .dot-tarjeta_roja { background: #dc2626; }
    .dot-sustitucion { background: var(--primary); }
    .tl-content { flex: 1; display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
    .tl-minute { font-weight: 700; color: var(--primary); min-width: 2.5rem; }
    .tl-player { font-weight: 500; color: var(--gray-800); }
    .tl-type { font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 4px; letter-spacing: 0.05em; }
    .type-gol { background: #f0fdf4; color: #15803d; }
    .type-tarjeta_amarilla { background: #fef9c3; color: #a16207; }
    .type-tarjeta_roja { background: #fef2f2; color: #dc2626; }
    .type-sustitucion { background: var(--primary-light); color: var(--primary-dark); }
    .tl-desc { font-size: 0.8rem; color: var(--gray-400); width: 100%; }
    .tl-equipo { font-size: 0.75rem; color: var(--gray-400); }
  `]
})
export class PartidoEnVivoComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly partidosService = inject(PartidosService);

  readonly partido = signal<PartidoDetalle | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly staleData = signal(false);
  readonly lastUpdate = signal<Date>(new Date());

  private refreshInterval: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error.set('ID de partido inválido.'); this.loading.set(false); return; }
    this.cargarEventos(id);
    this.refreshInterval = setInterval(() => this.cargarEventos(id), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  private cargarEventos(id: number): void {
    this.partidosService.getPartidoEnVivo(id).subscribe({
      next: res => {
        this.partido.set(res.data);
        this.lastUpdate.set(new Date());
        this.loading.set(false);
        this.staleData.set(false);
      },
      error: () => {
        if (!this.partido()) { this.loading.set(false); this.error.set('Error al cargar los eventos del partido.'); }
        else { this.staleData.set(true); }
      }
    });
  }

  labelTipo(tipo: string): string {
    const labels: Record<string, string> = { GOL: 'Gol', TARJETA_AMARILLA: 'Amarilla', TARJETA_ROJA: 'Roja', SUSTITUCION: 'Cambio' };
    return labels[tipo] || tipo;
  }
}
