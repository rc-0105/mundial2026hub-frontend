import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PreferenciasService } from '../../core/services/preferencias.service';
import { PreferenciasUsuario, NotificacionChannel } from '../../core/models/preferencias.model';

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

          <div class="form-section">
            <h2>Selecciones favoritas</h2>
            <p class="section-desc">Agregá las selecciones que querés seguir en tu agenda</p>
            <div class="tag-list">
              @for (s of seleccionesFavoritas(); track s) {
                <span class="tag">
                  Selección #{{ s }}
                  <button type="button" class="tag-remove" (click)="quitarSeleccion(s)">×</button>
                </span>
              }
            </div>
            <div class="add-row">
              <input type="number" #nuevaSel placeholder="ID de selección" class="add-input" />
              <button type="button" class="btn-secondary" (click)="agregarSeleccion(nuevaSel.value); nuevaSel.value=''">Agregar</button>
            </div>
          </div>

          <div class="form-section">
            <h2>Ciudades de interés</h2>
            <p class="section-desc">Ciudades sede que te interesan</p>
            <div class="tag-list">
              @for (c of ciudadesInteres(); track c) {
                <span class="tag">
                  Ciudad #{{ c }}
                  <button type="button" class="tag-remove" (click)="quitarCiudad(c)">×</button>
                </span>
              }
            </div>
            <div class="add-row">
              <input type="number" #nuevaCiudad placeholder="ID de ciudad" class="add-input" />
              <button type="button" class="btn-secondary" (click)="agregarCiudad(nuevaCiudad.value); nuevaCiudad.value=''">Agregar</button>
            </div>
          </div>

          <div class="form-section">
            <h2>Estadios de interés</h2>
            <p class="section-desc">Estadios que querés seguir</p>
            <div class="tag-list">
              @for (e of estadiosInteres(); track e) {
                <span class="tag">
                  Estadio #{{ e }}
                  <button type="button" class="tag-remove" (click)="quitarEstadio(e)">×</button>
                </span>
              }
            </div>
            <div class="add-row">
              <input type="number" #nuevoEstadio placeholder="ID de estadio" class="add-input" />
              <button type="button" class="btn-secondary" (click)="agregarEstadio(nuevoEstadio.value); nuevoEstadio.value=''">Agregar</button>
            </div>
          </div>

          <div class="form-section">
            <h2>Canales de notificación</h2>
            <p class="section-desc">Activá o desactivá los canales por los que querés recibir alertas</p>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              @for (ch of canalesNotificacion(); track ch.tipo; let i = $index) {
                <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; padding: 0.5rem 0;">
                  <input type="checkbox" [(ngModel)]="ch.activo" [name]="'ch_' + ch.tipo" style="width: 1.1rem; height: 1.1rem; accent-color: var(--primary); cursor: pointer;" />
                  <span style="font-weight: 500; font-size: 0.95rem; color: var(--gray-700);">{{ labelCanal(ch.tipo) }}</span>
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
  `
})
export class PreferenciasComponent implements OnInit {
  private readonly preferenciasService = inject(PreferenciasService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly seleccionesFavoritas = signal<number[]>([]);
  readonly ciudadesInteres = signal<number[]>([]);
  readonly estadiosInteres = signal<number[]>([]);
  readonly canalesNotificacion = signal<NotificacionChannel[]>([
    { tipo: 'EMAIL', activo: true },
    { tipo: 'SMS', activo: false },
    { tipo: 'PUSH', activo: false }
  ]);

  ngOnInit(): void {
    this.cargarPreferencias();
  }

  private cargarPreferencias(): void {
    this.preferenciasService.getPreferencias().subscribe({
      next: res => {
        this.seleccionesFavoritas.set(res.data.seleccionesFavoritas);
        this.ciudadesInteres.set(res.data.ciudadesInteres);
        this.estadiosInteres.set(res.data.estadiosInteres);
        if (res.data.canalesNotificacion?.length) {
          this.canalesNotificacion.set(res.data.canalesNotificacion);
        }
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  agregarSeleccion(id: string): void {
    const n = Number(id);
    if (n && !this.seleccionesFavoritas().includes(n)) {
      this.seleccionesFavoritas.update(v => [...v, n]);
    }
  }

  quitarSeleccion(id: number): void {
    this.seleccionesFavoritas.update(v => v.filter(s => s !== id));
  }

  agregarCiudad(id: string): void {
    const n = Number(id);
    if (n && !this.ciudadesInteres().includes(n)) {
      this.ciudadesInteres.update(v => [...v, n]);
    }
  }

  quitarCiudad(id: number): void {
    this.ciudadesInteres.update(v => v.filter(c => c !== id));
  }

  agregarEstadio(id: string): void {
    const n = Number(id);
    if (n && !this.estadiosInteres().includes(n)) {
      this.estadiosInteres.update(v => [...v, n]);
    }
  }

  quitarEstadio(id: number): void {
    this.estadiosInteres.update(v => v.filter(e => e !== id));
  }

  labelCanal(tipo: string): string {
    const labels: Record<string, string> = { EMAIL: 'Correo electrónico', SMS: 'SMS', PUSH: 'Notificaciones push' };
    return labels[tipo] || tipo;
  }

  guardar(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.saving.set(true);

    this.preferenciasService.updatePreferencias({
      seleccionesFavoritas: this.seleccionesFavoritas(),
      ciudadesInteres: this.ciudadesInteres(),
      estadiosInteres: this.estadiosInteres(),
      canalesNotificacion: this.canalesNotificacion().map(ch => ({ tipo: ch.tipo, activo: ch.activo }))
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
