import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { PreferenciasService } from '../../core/services/preferencias.service';
import { CatalogoService } from '../../core/services/catalogo.service';

@Component({
  selector: 'app-onboarding',
  imports: [],
  templateUrl: './onboarding.component.html',
})
export class OnboardingComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly preferenciasService = inject(PreferenciasService);
  private readonly router = inject(Router);
  readonly catalogo = inject(CatalogoService);

  readonly currentStep = signal(1);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly seleccionesElegidas = signal<number[]>([]);
  readonly ciudadesElegidas = signal<number[]>([]);
  readonly estadiosElegidos = signal<number[]>([]);
  readonly canalesActivos = signal<string[]>(['EMAIL']);

  readonly canalesDisponibles = ['EMAIL', 'PUSH'];

  ngOnInit(): void {
    if (!this.authService.requiresOnboarding()) {
      this.router.navigate(['/agenda']);
    }
  }

  toggleSeleccion(id: number): void {
    this.seleccionesElegidas.update(v =>
      v.includes(id) ? v.filter(s => s !== id) : [...v, id]
    );
  }

  toggleCiudad(id: number): void {
    this.ciudadesElegidas.update(v =>
      v.includes(id) ? v.filter(c => c !== id) : [...v, id]
    );
  }

  toggleEstadio(id: number): void {
    this.estadiosElegidos.update(v =>
      v.includes(id) ? v.filter(e => e !== id) : [...v, id]
    );
  }

  isSeleccionElegida(id: number): boolean {
    return this.seleccionesElegidas().includes(id);
  }

  isCiudadElegida(id: number): boolean {
    return this.ciudadesElegidas().includes(id);
  }

  isEstadioElegido(id: number): boolean {
    return this.estadiosElegidos().includes(id);
  }

  toggleCanal(canal: string): void {
    this.canalesActivos.update(v =>
      v.includes(canal) ? v.filter(c => c !== canal) : [...v, canal]
    );
  }

  canalActivo(canal: string): boolean {
    return this.canalesActivos().includes(canal);
  }

  siguientePaso(): void {
    this.error.set(null);
    if (this.currentStep() < 5) {
      this.currentStep.update(s => s + 1);
    }
  }

  pasoAnterior(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  finalizarOnboarding(): void {
    this.error.set(null);
    this.loading.set(true);

    this.preferenciasService.completarOnboarding({
      paso: 5,
      seleccionesFavoritas: this.seleccionesElegidas().join(','),
      ciudadesFavoritas: this.ciudadesElegidas().join(','),
      estadiosFavoritos: this.estadiosElegidos().join(','),
      canalesNotificacion: this.mapearCanales(),
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.authService.onboardingCompleted();
        this.router.navigate(['/agenda']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Error al guardar preferencias. Intenta nuevamente.');
      }
    });
  }

  omitir(): void {
    this.authService.onboardingCompleted();
    this.router.navigate(['/agenda']);
  }

  private mapearCanales(): string {
    const activos = this.canalesActivos();
    const tieneEmail = activos.includes('EMAIL');
    const tienePush = activos.includes('PUSH');
    if (tieneEmail && tienePush) return 'AMBOS';
    if (tieneEmail) return 'EMAIL';
    if (tienePush) return 'PUSH';
    return 'NINGUNO';
  }

  labelCanal(tipo: string): string {
    const labels: Record<string, string> = {
      EMAIL: 'Correo electrónico',
      SMS: 'SMS',
      PUSH: 'Notificaciones push',
    };
    return labels[tipo] || tipo;
  }

  nombreSeleccion(id: number): string {
    return this.catalogo.selecciones.find(s => s.id === id)?.nombre ?? `#${id}`;
  }

  nombreCiudad(id: number): string {
    return this.catalogo.ciudades.find(c => c.id === id)?.nombre ?? `#${id}`;
  }

  nombreEstadio(id: number): string {
    return this.catalogo.estadios.find(e => e.id === id)?.nombre ?? `#${id}`;
  }
}
