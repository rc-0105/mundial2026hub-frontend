import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PartidosService } from '../../core/services/partidos.service';
import { Partido } from '../../core/models/partido.model';

@Component({
  selector: 'app-agenda',
  imports: [RouterLink],
  template: `
    <div class="page-container">
      <h1>Mi Agenda Personal</h1>
      <p class="subtitle">Partidos filtrados por tus selecciones y sedes favoritas</p>

      @if (loading()) {
        <div class="loading">Cargando agenda</div>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
      } @else if (partidos().length === 0) {
        <div class="empty-state">
          <p>No hay partidos en tu agenda.</p>
          <p class="hint">Configurá tus preferencias en <a routerLink="/preferencias">Mis Preferencias</a> para ver partidos relevantes.</p>
        </div>
      } @else {
        <div style="display: grid; gap: 1rem;">
          @for (p of partidos(); track p.idPartido) {
            <div class="match-card" [class]="'match-card status-' + p.estado.toLowerCase()">
              <div class="match-header">
                <span class="phase-badge">{{ p.fase }}</span>
                <span class="status-badge" [class]="'status-badge status-' + p.estado.toLowerCase()">
                  {{ labelEstado(p.estado) }}
                </span>
              </div>
              <div class="match-teams">
                <div class="team team-local">
                  <span class="team-name">{{ p.seleccionLocal }}</span>
                </div>
                <div class="score-display">
                  @if (p.estado === 'PROGRAMADO') {
                    <span class="vs">VS</span>
                  } @else {
                    <span class="score-val">{{ p.golesLocal ?? '-' }}</span>
                    <span class="score-sep">-</span>
                    <span class="score-val">{{ p.golesVisitante ?? '-' }}</span>
                  }
                </div>
                <div class="team team-visitante">
                  <span class="team-name">{{ p.seleccionVisitante }}</span>
                </div>
              </div>
              <div class="match-info">
                <span>{{ p.fechaHoraLocalizada }}</span>
                <span>{{ p.estadio }}, {{ p.ciudad }}</span>
              </div>
              <div class="match-actions">
                @if (p.estado === 'FINALIZADO' || p.estado === 'EN_JUEGO') {
                  <a [routerLink]="['/partidos', p.idPartido]" class="btn-detail">Ver detalle</a>
                }
                @if (p.estado === 'EN_JUEGO') {
                  <a [routerLink]="['/partidos', p.idPartido, 'en-vivo']" class="btn-live">En vivo</a>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class AgendaComponent implements OnInit, OnDestroy {
  private readonly partidosService = inject(PartidosService);

  readonly partidos = signal<Partido[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private refreshInterval: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    this.cargarAgenda();
    this.refreshInterval = setInterval(() => this.cargarAgenda(), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  private cargarAgenda(): void {
    this.partidosService.getAgenda().subscribe({
      next: res => {
        this.partidos.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        if (this.partidos().length === 0) {
          this.loading.set(false);
          this.error.set('Error al cargar la agenda.');
        }
      }
    });
  }

  labelEstado(estado: string): string {
    const labels: Record<string, string> = { PROGRAMADO: 'Programado', EN_JUEGO: 'En juego', FINALIZADO: 'Finalizado' };
    return labels[estado] || estado;
  }
}
