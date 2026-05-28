import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { PartidosService } from '../../core/services/partidos.service';
import { PreferenciasService } from '../../core/services/preferencias.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { Partido } from '../../core/models/partido.model';

@Component({
  selector: 'app-agenda',
  imports: [RouterLink, DatePipe],
  template: `
    <div class="page-container">
      <h1>Mi Agenda</h1>
      <p class="subtitle">Partidos de tus selecciones y sedes favoritas</p>

      @if (loading()) {
        <div class="loading">Cargando agenda</div>
      } @else if (sinPreferencias()) {
        <div class="empty-state">
          <p>Todavía no configuraste tus preferencias.</p>
          <p class="hint">Andá a <a routerLink="/preferencias">Mis Preferencias</a> para elegir selecciones, ciudades y estadios favoritos.</p>
        </div>
      } @else if (partidos().length === 0) {
        <div class="empty-state">
          <p>No hay partidos próximos para tus favoritos.</p>
          <p class="hint">Podés ajustar tus preferencias en <a routerLink="/preferencias">Mis Preferencias</a>.</p>
        </div>
      } @else {
        @if (staleData()) {
          <div class="stale-banner">Mostrando últimos datos disponibles. El proveedor externo no responde.</div>
        }
        <div style="margin-bottom: 1rem; font-size: 0.85rem; color: var(--gray-500);">
          {{ partidos().length }} partido{{ partidos().length === 1 ? '' : 's' }} encontrado{{ partidos().length === 1 ? '' : 's' }}
        </div>
        <div style="display: grid; gap: 1rem;">
          @for (p of partidos(); track p.idPartido) {
            <div class="match-card" [class]="'match-card status-' + p.estado.toLowerCase()">
              <div class="match-header">
                <span class="phase-badge">{{ labelFase(p.fase) }}</span>
                <span class="status-badge" [class]="'status-badge status-' + p.estado.toLowerCase()">
                  {{ labelEstado(p.estado) }}
                </span>
              </div>
              <div class="match-teams">
                <div class="team team-local" [class.team-favorita]="esFavorita(p.seleccionLocal.idSeleccion)">
                  <span class="team-name">{{ p.seleccionLocal.nombre }}</span>
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
                <div class="team team-visitante" [class.team-favorita]="esFavorita(p.seleccionVisitante.idSeleccion)">
                  <span class="team-name">{{ p.seleccionVisitante.nombre }}</span>
                </div>
              </div>
              <div class="match-info">
                <span>{{ p.fecha | date:'dd/MM/yyyy HH:mm' }}</span>
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
  `,
  styles: [`
    .team-favorita .team-name {
      color: var(--primary, #2563eb);
      font-weight: 700;
    }
  `]
})
export class AgendaComponent implements OnInit, OnDestroy {
  private readonly partidosService = inject(PartidosService);
  private readonly preferenciasService = inject(PreferenciasService);
  private readonly catalogo = inject(CatalogoService);

  readonly partidos = signal<Partido[]>([]);
  readonly loading = signal(true);
  readonly staleData = signal(false);
  readonly sinPreferencias = signal(false);

  private seleccionIds: number[] = [];
  private estadioIds: number[] = [];
  private ciudadNombres: string[] = [];

  private refreshInterval: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    this.cargarDatos();
    this.refreshInterval = setInterval(() => this.cargarPartidos(), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  private cargarDatos(): void {
    forkJoin({
      prefs: this.preferenciasService.getPreferencias(),
      partidos: this.partidosService.getPartidos(),
    }).subscribe({
      next: ({ prefs, partidos }) => {
        const p = prefs.data;
        this.seleccionIds = this.parseCsv(p.seleccionesFavoritas);
        this.estadioIds = this.parseCsv(p.estadiosFavoritos);
        const ciudadIds = this.parseCsv(p.ciudadesFavoritas);
        this.ciudadNombres = ciudadIds
          .map(id => this.catalogo.ciudades.find(c => c.id === id)?.nombre ?? '')
          .filter(Boolean);

        const tienePref = this.seleccionIds.length > 0 || this.estadioIds.length > 0 || this.ciudadNombres.length > 0;
        this.sinPreferencias.set(!tienePref);

        this.partidos.set(this.filtrar(partidos.data));
        this.staleData.set(partidos.actualizacionPendiente);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private cargarPartidos(): void {
    this.partidosService.getPartidos().subscribe({
      next: res => {
        this.partidos.set(this.filtrar(res.data));
        this.staleData.set(res.actualizacionPendiente);
      },
      error: () => {}
    });
  }

  private filtrar(todos: Partido[]): Partido[] {
    return todos.filter(p =>
      this.seleccionIds.includes(p.seleccionLocal.idSeleccion ?? -1) ||
      this.seleccionIds.includes(p.seleccionVisitante.idSeleccion ?? -1) ||
      this.ciudadNombres.includes(p.ciudad)
    );
  }

  esFavorita(idSeleccion: number | null): boolean {
    return idSeleccion != null && this.seleccionIds.includes(idSeleccion);
  }

  private parseCsv(csv: string | undefined | null): number[] {
    if (!csv?.trim()) return [];
    return csv.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  }

  labelEstado(estado: string): string {
    const labels: Record<string, string> = { PROGRAMADO: 'Programado', EN_JUEGO: 'En juego', FINALIZADO: 'Finalizado' };
    return labels[estado] || estado;
  }

  labelFase(fase: string): string {
    const labels: Record<string, string> = {
      GRUPOS: 'Fase de Grupos',
      OCTAVOS: 'Octavos de final',
      CUARTOS: 'Cuartos de final',
      SEMIFINAL: 'Semifinal',
      TERCER_PUESTO: '3er puesto',
      FINAL: 'Final',
    };
    return labels[fase] || fase;
  }
}
