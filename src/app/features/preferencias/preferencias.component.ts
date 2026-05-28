import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PreferenciasService } from '../../core/services/preferencias.service';
import { CatalogoService } from '../../core/services/catalogo.service';

@Component({
  selector: 'app-preferencias',
  imports: [FormsModule],
  template: `
    <div class="page-container">
      <h1>Mis Preferencias</h1>
      <p class="subtitle">Personalizá tu experiencia seleccionando tus equipos, sedes y canales de notificación favoritos</p>

      @if (loading()) {
        <div class="loading">Cargando preferencias</div>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
      } @else {
        <form (ngSubmit)="guardar()" style="display: flex; flex-direction: column; gap: 1.5rem;">

          <!-- SELECCIONES -->
          <div class="form-section">
            <h2>Selecciones favoritas</h2>
            <p class="section-desc">Agregá las selecciones que querés seguir en tu agenda</p>
            <div class="tag-list">
              @for (id of seleccionesFavoritas(); track id) {
                <span class="tag">
                  {{ nombreSeleccion(id) }}
                  <button type="button" class="tag-remove" (click)="quitarSeleccion(id)">×</button>
                </span>
              }
            </div>
            <div class="add-row">
              <select [(ngModel)]="seleccionPendiente" [ngModelOptions]="{standalone: true}" class="add-select">
                <option value="">— Elegí una selección —</option>
                @for (s of seleccionesDisponibles(); track s.id) {
                  <option [value]="s.id">{{ s.nombre }}</option>
                }
              </select>
              <button type="button" class="btn-secondary"
                [disabled]="!seleccionPendiente"
                (click)="agregarSeleccion()">Agregar</button>
            </div>
          </div>

          <!-- CIUDADES -->
          <div class="form-section">
            <h2>Ciudades de interés</h2>
            <p class="section-desc">Ciudades sede que te interesan</p>
            <div class="tag-list">
              @for (id of ciudadesFavoritas(); track id) {
                <span class="tag">
                  {{ nombreCiudad(id) }}
                  <button type="button" class="tag-remove" (click)="quitarCiudad(id)">×</button>
                </span>
              }
            </div>
            <div class="add-row">
              <select [(ngModel)]="ciudadPendiente" [ngModelOptions]="{standalone: true}" class="add-select">
                <option value="">— Elegí una ciudad —</option>
                @for (c of ciudadesDisponibles(); track c.id) {
                  <option [value]="c.id">{{ c.nombre }}</option>
                }
              </select>
              <button type="button" class="btn-secondary"
                [disabled]="!ciudadPendiente"
                (click)="agregarCiudad()">Agregar</button>
            </div>
          </div>

          <!-- ESTADIOS -->
          <div class="form-section">
            <h2>Estadios de interés</h2>
            <p class="section-desc">Estadios que querés seguir</p>
            <div class="tag-list">
              @for (id of estadiosFavoritos(); track id) {
                <span class="tag">
                  {{ nombreEstadio(id) }}
                  <button type="button" class="tag-remove" (click)="quitarEstadio(id)">×</button>
                </span>
              }
            </div>
            <div class="add-row">
              <select [(ngModel)]="estadioPendiente" [ngModelOptions]="{standalone: true}" class="add-select">
                <option value="">— Elegí un estadio —</option>
                @for (e of estadiosDisponibles(); track e.id) {
                  <option [value]="e.id">{{ e.nombre }} — {{ e.ciudad }}</option>
                }
              </select>
              <button type="button" class="btn-secondary"
                [disabled]="!estadioPendiente"
                (click)="agregarEstadio()">Agregar</button>
            </div>
          </div>

          <!-- CANALES -->
          <div class="form-section">
            <h2>Canales de notificación</h2>
            <p class="section-desc">Activá o desactivá los canales por los que querés recibir alertas</p>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              @for (canal of canalesDisponibles; track canal) {
                <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; padding: 0.5rem 0;">
                  <input type="checkbox" [checked]="canalActivo(canal)" (change)="toggleCanal(canal)"
                    style="width: 1.1rem; height: 1.1rem; accent-color: var(--primary); cursor: pointer;" />
                  <span style="font-weight: 500; font-size: 0.95rem; color: var(--gray-700);">{{ labelCanal(canal) }}</span>
                </label>
              }
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="saving()">
              {{ saving() ? 'Guardando...' : 'Guardar preferencias' }}
            </button>
            @if (successMessage()) {
              <span class="success">{{ successMessage() }}</span>
            }
            @if (errorMessage()) {
              <span class="error" style="margin: 0;">{{ errorMessage() }}</span>
            }
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .add-select {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-size: 0.9rem;
      color: var(--gray-700);
      background: var(--surface);
      cursor: pointer;
    }
    .add-select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-light);
    }
  `]
})
export class PreferenciasComponent implements OnInit {
  private readonly preferenciasService = inject(PreferenciasService);
  private readonly catalogo = inject(CatalogoService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly seleccionesFavoritas = signal<number[]>([]);
  readonly ciudadesFavoritas = signal<number[]>([]);
  readonly estadiosFavoritos = signal<number[]>([]);
  readonly canalesActivos = signal<string[]>(['EMAIL']);

  seleccionPendiente: number | '' = '';
  ciudadPendiente: number | '' = '';
  estadioPendiente: number | '' = '';

  readonly canalesDisponibles = ['EMAIL', 'SMS', 'PUSH'];

  // Listas filtradas — excluyen lo ya agregado
  seleccionesDisponibles = signal(this.catalogo.selecciones);
  ciudadesDisponibles = signal(this.catalogo.ciudades);
  estadiosDisponibles = signal(this.catalogo.estadios);

  ngOnInit(): void {
    this.cargarPreferencias();
  }

  private cargarPreferencias(): void {
    this.preferenciasService.getPreferencias().subscribe({
      next: res => {
        this.seleccionesFavoritas.set(this.parseCsv(res.data.seleccionesFavoritas));
        this.ciudadesFavoritas.set(this.parseCsv(res.data.ciudadesFavoritas));
        this.estadiosFavoritos.set(this.parseCsv(res.data.estadiosFavoritos));
        this.canalesActivos.set(
          res.data.canalesNotificacion
            ? res.data.canalesNotificacion.split(',').map((s: string) => s.trim()).filter(Boolean)
            : ['EMAIL']
        );
        this.actualizarDisponibles();
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  private parseCsv(csv: string): number[] {
    if (!csv) return [];
    return csv.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0);
  }

  private actualizarDisponibles(): void {
    this.seleccionesDisponibles.set(
      this.catalogo.selecciones.filter(s => !this.seleccionesFavoritas().includes(s.id))
    );
    this.ciudadesDisponibles.set(
      this.catalogo.ciudades.filter(c => !this.ciudadesFavoritas().includes(c.id))
    );
    this.estadiosDisponibles.set(
      this.catalogo.estadios.filter(e => !this.estadiosFavoritos().includes(e.id))
    );
  }

  agregarSeleccion(): void {
    const id = Number(this.seleccionPendiente);
    if (!id || this.seleccionesFavoritas().includes(id)) return;
    this.seleccionesFavoritas.update(v => [...v, id]);
    this.seleccionPendiente = '';
    this.actualizarDisponibles();
  }

  quitarSeleccion(id: number): void {
    this.seleccionesFavoritas.update(v => v.filter(s => s !== id));
    this.actualizarDisponibles();
  }

  agregarCiudad(): void {
    const id = Number(this.ciudadPendiente);
    if (!id || this.ciudadesFavoritas().includes(id)) return;
    this.ciudadesFavoritas.update(v => [...v, id]);
    this.ciudadPendiente = '';
    this.actualizarDisponibles();
  }

  quitarCiudad(id: number): void {
    this.ciudadesFavoritas.update(v => v.filter(c => c !== id));
    this.actualizarDisponibles();
  }

  agregarEstadio(): void {
    const id = Number(this.estadioPendiente);
    if (!id || this.estadiosFavoritos().includes(id)) return;
    this.estadiosFavoritos.update(v => [...v, id]);
    this.estadioPendiente = '';
    this.actualizarDisponibles();
  }

  quitarEstadio(id: number): void {
    this.estadiosFavoritos.update(v => v.filter(e => e !== id));
    this.actualizarDisponibles();
  }

  nombreSeleccion(id: number): string {
    return this.catalogo.selecciones.find(s => s.id === id)?.nombre ?? `Selección #${id}`;
  }

  nombreCiudad(id: number): string {
    return this.catalogo.ciudades.find(c => c.id === id)?.nombre ?? `Ciudad #${id}`;
  }

  nombreEstadio(id: number): string {
    const e = this.catalogo.estadios.find(e => e.id === id);
    return e ? `${e.nombre} — ${e.ciudad}` : `Estadio #${id}`;
  }

  canalActivo(canal: string): boolean {
    return this.canalesActivos().includes(canal);
  }

  toggleCanal(canal: string): void {
    this.canalesActivos.update(v =>
      v.includes(canal) ? v.filter(c => c !== canal) : [...v, canal]
    );
  }

  labelCanal(tipo: string): string {
    const labels: Record<string, string> = {
      EMAIL: 'Correo electrónico',
      SMS: 'SMS',
      PUSH: 'Notificaciones push',
    };
    return labels[tipo] || tipo;
  }

  guardar(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.saving.set(true);

    this.preferenciasService.updatePreferencias({
      seleccionesFavoritas: this.seleccionesFavoritas().join(','),
      ciudadesFavoritas: this.ciudadesFavoritas().join(','),
      estadiosFavoritos: this.estadiosFavoritos().join(','),
      canalesNotificacion: this.canalesActivos().join(','),
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Preferencias guardadas correctamente.');
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('Error al guardar preferencias.');
      }
    });
  }
}
