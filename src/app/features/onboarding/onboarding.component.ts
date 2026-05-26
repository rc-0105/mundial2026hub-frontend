import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/services/auth.service';
import { PreferenciasService } from '../../core/services/preferencias.service';
import { NotificacionChannel } from '../../core/models/preferencias.model';

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
  readonly ciudadesInteres = signal<number[]>([]);
  readonly estadiosInteres = signal<number[]>([]);
  readonly canalesNotificacion = signal<NotificacionChannel[]>([
    { tipo: 'EMAIL', activo: true },
    { tipo: 'SMS', activo: false },
    { tipo: 'PUSH', activo: false }
  ]);

  // Computed properties para templates
  readonly canalesActivos = computed(() => 
    this.canalesNotificacion().filter(c => c.activo).length
  );

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
    if (id && !this.ciudadesInteres().includes(id)) {
      this.ciudadesInteres.update(v => [...v, id]);
      this.inputCiudad = '';
    }
  }

  quitarCiudad(id: number): void {
    this.ciudadesInteres.update(v => v.filter(c => c !== id));
  }

  // Paso 3: Estadios
  agregarEstadio(): void {
    const id = Number(this.inputEstadio);
    if (id && !this.estadiosInteres().includes(id)) {
      this.estadiosInteres.update(v => [...v, id]);
      this.inputEstadio = '';
    }
  }

  quitarEstadio(id: number): void {
    this.estadiosInteres.update(v => v.filter(e => e !== id));
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

    this.preferenciasService.updatePreferencias({
      seleccionesFavoritas: this.seleccionesFavoritas(),
      ciudadesInteres: this.ciudadesInteres(),
      estadiosInteres: this.estadiosInteres(),
      canalesNotificacion: this.canalesNotificacion().map(c => ({ tipo: c.tipo, activo: c.activo }))
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

  labelCanal(tipo: string): string {
    const labels: Record<string, string> = {
      EMAIL: 'Correo electrónico',
      SMS: 'SMS',
      PUSH: 'Notificaciones push'
    };
    return labels[tipo] || tipo;
  }
}
