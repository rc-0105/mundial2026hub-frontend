import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PartidosService } from '../../../core/services/partidos.service';
import { PartidoDetalle, GolInfo, Sustitucion } from '../../../core/models/partido.model';

@Component({
  selector: 'app-partido-detalle',
  imports: [RouterLink, DatePipe],
  template: `
    <div class="page-container">
      <a routerLink="/partidos" style="display: inline-flex; align-items: center; gap: 0.4rem; margin-bottom: 1.5rem; color: var(--gray-500); font-size: 0.9rem; font-weight: 500;">
        ← Volver al calendario
      </a>

      @if (loading()) {
        <div class="loading">Cargando detalle del partido</div>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
      } @else if (partido(); as p) {
        @if (p.estado !== 'FINALIZADO') {
          <div style="background: #fffbeb; color: #92400e; border: 1px solid #fde68a; border-radius: var(--radius); padding: 1rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem; font-size: 0.9rem;">
            <span>Este partido aún no ha finalizado.</span>
            @if (p.estado === 'EN_JUEGO') {
              <a [routerLink]="['/partidos', p.idPartido, 'en-vivo']" class="btn-live" style="margin-left: auto;">Ver en vivo</a>
            }
          </div>
        }

        <div class="match-hero">
          <div class="hero-teams">
            <div class="hero-team">
              <span class="hero-team-name">{{ p.seleccionLocal.nombre }}</span>
            </div>
            <div class="hero-score">
              <span class="hero-score-val">{{ p.marcadorLocal ?? '-' }}</span>
              <span class="hero-score-sep">-</span>
              <span class="hero-score-val">{{ p.marcadorVisitante ?? '-' }}</span>
            </div>
            <div class="hero-team hero-team-right">
              <span class="hero-team-name">{{ p.seleccionVisitante.nombre }}</span>
            </div>
          </div>
          <div class="hero-meta">
            <span class="hero-phase">{{ p.fase }}</span>
            <span>{{ p.fecha | date:'dd/MM/yyyy HH:mm' }}</span>
            <span>{{ p.estadio.nombre }}, {{ p.estadio.ciudad }}</span>
          </div>
        </div>

        @if (p.posesionLocal != null && p.posesionVisitante != null) {
          <div class="detail-section">
            <h2 class="section-title">Estadísticas</h2>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <span style="font-weight: 700; font-size: 1rem; min-width: 3rem; text-align: right;">{{ p.posesionLocal }}%</span>
              <div style="flex: 1; height: 8px; background: var(--gray-100); border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: {{ p.posesionLocal }}%; background: var(--primary); border-radius: 4px; transition: width 0.5s;"></div>
              </div>
              <span style="font-size: 0.85rem; color: var(--gray-400); min-width: 4rem; text-align: center;">Posesión</span>
              <div style="flex: 1; height: 8px; background: var(--gray-100); border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: {{ p.posesionVisitante }}%; background: var(--gray-500); border-radius: 4px; float: right; transition: width 0.5s;"></div>
              </div>
              <span style="font-weight: 700; font-size: 1rem; min-width: 3rem;">{{ p.posesionVisitante }}%</span>
            </div>
          </div>
        }

        @if (goles().length > 0) {
          <div class="detail-section">
            <h2 class="section-title">Goles</h2>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              @for (g of goles(); track g.minuto + g.jugador) {
                <div class="event-row" [class]="'event-' + g.equipo.toLowerCase()">
                  <span class="event-minute">{{ g.minuto }}'</span>
                  <span class="event-player">{{ g.jugador }}</span>
                  @if (g.asistencia) {
                    <span style="font-size: 0.8rem; color: var(--gray-400);">(asistencia: {{ g.asistencia }})</span>
                  }
                  <span class="event-team">{{ g.equipo === 'LOCAL' ? p.seleccionLocal.nombre : p.seleccionVisitante.nombre }}</span>
                </div>
              }
            </div>
          </div>
        }

        @if (tarjetas().length > 0) {
          <div class="detail-section">
            <h2 class="section-title">Tarjetas</h2>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              @for (t of tarjetas(); track t.idEvento) {
                <div class="event-row" [class]="'event-' + t.equipo.toLowerCase()">
                  <span class="event-minute">{{ t.minuto }}'</span>
                  <span class="event-player">{{ t.jugador }}</span>
                  <span class="card-pill" [class]="t.tipo === 'TARJETA_ROJA' ? 'card-red' : 'card-yellow'">
                    {{ t.tipo === 'TARJETA_ROJA' ? 'ROJA' : 'AMARILLA' }}
                  </span>
                  <span class="event-team">{{ t.equipo === 'LOCAL' ? p.seleccionLocal.nombre : p.seleccionVisitante.nombre }}</span>
                </div>
              }
            </div>
          </div>
        }

        @if (sustituciones().length > 0) {
          <div class="detail-section">
            <h2 class="section-title">Sustituciones</h2>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              @for (s of sustituciones(); track s.minuto + s.sale) {
                <div class="event-row event-sub">
                  <span class="event-minute">{{ s.minuto }}'</span>
                  <span style="font-weight: 500;">Sale: {{ s.sale }}</span>
                  <span style="color: var(--primary); font-weight: 700;">→</span>
                  <span style="font-weight: 500;">Entra: {{ s.entra }}</span>
                  <span class="event-team">{{ s.equipo === 'LOCAL' ? p.seleccionLocal.nombre : p.seleccionVisitante.nombre }}</span>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .match-hero {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2.5rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow);
      background: linear-gradient(135deg, var(--surface) 0%, var(--gray-50) 100%);
    }
    .hero-teams { display: flex; align-items: center; justify-content: center; gap: 2rem; margin-bottom: 1.25rem; }
    .hero-team { flex: 1; }
    .hero-team-right { text-align: left; }
    .hero-team:first-child { text-align: right; }
    .hero-team-name { font-weight: 800; font-size: 1.4rem; color: var(--gray-900); }
    .hero-score { display: flex; align-items: center; gap: 0.75rem; }
    .hero-score-val { font-size: 3.5rem; font-weight: 900; color: var(--gray-900); line-height: 1; }
    .hero-score-sep { font-size: 2.5rem; color: var(--gray-300); }
    .hero-meta { display: flex; justify-content: center; gap: 1.5rem; font-size: 0.85rem; color: var(--gray-400); flex-wrap: wrap; }
    .hero-phase { font-weight: 600; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; }
    .detail-section {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: var(--shadow-sm);
    }
    .section-title { font-size: 1rem; font-weight: 600; color: var(--gray-900); margin: 0 0 1rem; }
    .event-row {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.6rem 0.85rem; border-radius: var(--radius);
      font-size: 0.9rem;
    }
    .event-local { background: var(--primary-light); }
    .event-visitante { background: var(--gray-50); }
    .event-sub { background: var(--gray-50); }
    .event-minute { font-weight: 700; color: var(--primary); min-width: 2.5rem; }
    .event-player { font-weight: 500; color: var(--gray-800); }
    .event-team { font-size: 0.75rem; color: var(--gray-400); margin-left: auto; }
    .card-pill { font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 4px; letter-spacing: 0.05em; }
    .card-yellow { background: #fef9c3; color: #a16207; }
    .card-red { background: #fef2f2; color: #dc2626; }
  `]
})
export class PartidoDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly partidosService = inject(PartidosService);

  readonly partido = signal<PartidoDetalle | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly goles = signal<GolInfo[]>([]);
  readonly tarjetas = signal<any[]>([]);
  readonly sustituciones = signal<Sustitucion[]>([]);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error.set('ID de partido inválido.'); this.loading.set(false); return; }
    this.cargarDetalle(id);
  }

  private cargarDetalle(id: number): void {
    this.partidosService.getPartido(id).subscribe({
      next: res => {
        this.partido.set(res.data);
        this.goles.set(res.data.eventos.filter(e => e.tipo === 'GOL').map(e => ({ minuto: e.minuto, jugador: e.jugador, equipo: e.equipo, asistencia: null })));
        this.tarjetas.set(res.data.eventos.filter(e => e.tipo === 'TARJETA_AMARILLA' || e.tipo === 'TARJETA_ROJA'));
        this.sustituciones.set(res.data.sustituciones ?? []);
        this.loading.set(false);
      },
      error: () => { this.error.set('Error al cargar el detalle del partido.'); this.loading.set(false); }
    });
  }
}
