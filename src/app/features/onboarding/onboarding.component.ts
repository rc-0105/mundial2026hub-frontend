import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/services/auth.service';
import { PreferenciasService } from '../../core/services/preferencias.service';

@Component({
  selector: 'app-onboarding',
  imports: [FormsModule],
  templateUrl: './onboarding.component.html',
})
export class OnboardingComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly preferenciasService = inject(PreferenciasService);
  private readonly router = inject(Router);

  readonly currentStep = signal(1);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly seleccionesFavoritas = signal<number[]>([]);
  readonly ciudadesFavoritas = signal<number[]>([]);
  readonly estadiosFavoritos = signal<number[]>([]);
  readonly canalesActivos = signal<string[]>(['EMAIL']);

  inputSeleccion = '';
  inputCiudad = '';
  inputEstadio = '';

  ngOnInit(): void {
    // Si el usuario no requiere onboarding, redirige
    if (!this.authService.requiresOnboarding()) {
      this.router.navigate(['/agenda']);
    }
  }

  // Paso 1: Selecciones
  agregarSeleccion(): void {
    const id = Number(this.inputSeleccion);
    if (id && !this.seleccionesFavoritas().includes(id)) {
      this.seleccionesFavoritas.update(v => [...v, id]);
      this.inputSeleccion = '';
    }
  }

  quitarSeleccion(id: number): void {
    this.seleccionesFavoritas.update(v => v.filter(s => s !== id));
  }

  // Paso 2: Ciudades
  agregarCiudad(): void {
    const id = Number(this.inputCiudad);
    if (id && !this.ciudadesFavoritas().includes(id)) {
      this.ciudadesFavoritas.update(v => [...v, id]);
      this.inputCiudad = '';
    }
  }

  quitarCiudad(id: number): void {
    this.ciudadesFavoritas.update(v => v.filter(c => c !== id));
  }

  // Paso 3: Estadios
  agregarEstadio(): void {
    const id = Number(this.inputEstadio);
    if (id && !this.estadiosFavoritos().includes(id)) {
      this.estadiosFavoritos.update(v => [...v, id]);
      this.inputEstadio = '';
    }
  }

  quitarEstadio(id: number): void {
    this.estadiosFavoritos.update(v => v.filter(e => e !== id));
  }

  toggleCanal(canal: string): void {
    this.canalesActivos.update(v =>
      v.includes(canal) ? v.filter(c => c !== canal) : [...v, canal]
    );
  }

  canalActivo(canal: string): boolean {
    return this.canalesActivos().includes(canal);
  }

  // Navegación
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

  // Finalizar onboarding
  finalizarOnboarding(): void {
    this.error.set(null);
    this.loading.set(true);

    this.preferenciasService.completarOnboarding({
      paso: 5,
      seleccionesFavoritas: this.seleccionesFavoritas().join(','),
      ciudadesFavoritas: this.ciudadesFavoritas().join(','),
      estadiosFavoritos: this.estadiosFavoritos().join(','),
      canalesNotificacion: this.canalesActivos().join(','),
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

  // Omitir onboarding
  omitir(): void {
    this.authService.onboardingCompleted();
    this.router.navigate(['/agenda']);
  }

  readonly canalesDisponibles = ['EMAIL', 'SMS', 'PUSH'];

  labelCanal(tipo: string): string {
    const labels: Record<string, string> = {
      EMAIL: 'Correo electrónico',
      SMS: 'SMS',
      PUSH: 'Notificaciones push',
    };
    return labels[tipo] || tipo;
  }
}
