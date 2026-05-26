import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PartidosService } from '../../core/services/partidos.service';
import { Partido } from '../../core/models/partido.model';

@Component({
  selector: 'app-partidos',
  imports: [RouterLink, FormsModule, DatePipe],
  template: `
    <div class="page-container">
      <h1>Calendario de Partidos</h1>
      <p class="subtitle">Todos los partidos del Mundial 2026</p>

      @if (loading()) {
        <div class="loading">Cargando partidos</div>
      } @else {
        @if (staleData()) {
          <div class="stale-banner">Mostrando últimos datos disponibles. El proveedor externo no responde.</div>
        }

        <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
          <select [(ngModel)]="filtroFase" (ngModelChange)="aplicarFiltros()" [ngModelOptions]="{standalone: true}"
            style="padding: 0.55rem 0.85rem; border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.85rem; background: var(--surface); color: var(--gray-700);">
            <option value="">Todas las fases</option>
            <option value="FASE_GRUPOS">Fase de Grupos</option>
            <option value="OCTAVOS">Octavos de final</option>
            <option value="CUARTOS">Cuartos de final</option>
            <option value="SEMIFINAL">Semifinal</option>
            <option value="TERCER_PUESTO">Tercer puesto</option>
            <option value="FINAL">Final</option>
          </select>
          <select [(ngModel)]="filtroEstado" (ngModelChange)="aplicarFiltros()" [ngModelOptions]="{standalone: true}"
            style="padding: 0.55rem 0.85rem; border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.85rem; background: var(--surface); color: var(--gray-700);">
            <option value="">Todos los estados</option>
            <option value="PROGRAMADO">Programado</option>
            <option value="EN_JUEGO">En juego</option>
            <option value="FINALIZADO">Finalizado</option>
          </select>
        </div>

        @if (filteredPartidos().length === 0) {
          <div class="empty-state">
            <p>No hay partidos con los filtros seleccionados.</p>
          </div>
        } @else {
          <div style="display: grid; gap: 1rem;">
            @for (p of filteredPartidos(); track p.idPartido) {
              <div class="match-card" [class]="'match-card status-' + p.estado.toLowerCase()">
                <div class="match-header">
                  <span class="phase-badge">{{ p.fase }}</span>
                  <span class="status-badge" [class]="'status-badge status-' + p.estado.toLowerCase()">
                    {{ labelEstado(p.estado) }}
                  </span>
                </div>
                <div class="match-teams">
                  <div class="team team-local">
                    <span class="team-name">{{ p.seleccionLocal.nombre }}</span>
                  </div>
                  <div class="score-display">
                    @if (p.estado === 'PROGRAMADO') {
                      <span class="vs">VS</span>
                    } @else {
                      <span class="score-val">{{ p.marcadorLocal ?? '-' }}</span>
                      <span class="score-sep">-</span>
                      <span class="score-val">{{ p.marcadorVisitante ?? '-' }}</span>
                    }
                  </div>
                  <div class="team team-visitante">
                    <span class="team-name">{{ p.seleccionVisitante.nombre }}</span>
                  </div>
                </div>
                <div class="match-info">
                  <span>{{ p.fecha | date:'dd/MM/yyyy HH:mm' }}</span>
                  <span>{{ p.estadio.nombre }}, {{ p.estadio.ciudad }}</span>
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
      }
    </div>
  `
})
export class PartidosComponent implements OnInit, OnDestroy {
  private readonly partidosService = inject(PartidosService);

  private allPartidos = signal<Partido[]>([]);
  readonly filteredPartidos = signal<Partido[]>([]);
  readonly loading = signal(true);
  readonly staleData = signal(false);

  filtroFase = '';
  filtroEstado = '';

  private refreshInterval: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    this.cargarPartidos();
    this.refreshInterval = setInterval(() => this.cargarPartidos(), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  private cargarPartidos(): void {
    this.partidosService.getPartidos().subscribe({
      next: res => {
        this.allPartidos.set(res.data);
        this.aplicarFiltros();
        this.loading.set(false);
        this.staleData.set(false);
      },
      error: () => {
        if (this.allPartidos().length === 0) this.loading.set(false);
        this.staleData.set(this.allPartidos().length > 0);
      }
    });
  }

  aplicarFiltros(): void {
    let result = this.allPartidos();
    if (this.filtroFase) result = result.filter(p => p.fase === this.filtroFase);
    if (this.filtroEstado) result = result.filter(p => p.estado === this.filtroEstado);
    this.filteredPartidos.set(result);
  }

  labelEstado(estado: string): string {
    const labels: Record<string, string> = { PROGRAMADO: 'Programado', EN_JUEGO: 'En juego', FINALIZADO: 'Finalizado' };
    return labels[estado] || estado;
  }
}
