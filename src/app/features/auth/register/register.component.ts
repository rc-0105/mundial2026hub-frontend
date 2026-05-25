import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/services/auth.service';
import { RegisterRequest } from '../../../core/auth/models/register-request.model';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);

  nombre = '';
  correo = '';
  password = '';
  confirmPassword = '';

  private validarPassword(p: string): boolean {
    return p.length >= 8 && /[A-Z]/.test(p) && /\d/.test(p);
  }

  register(): void {
    this.error.set(null);

    if (!this.nombre || !this.correo || !this.password) {
      this.error.set('Todos los campos son requeridos.');
      return;
    }

    if (!this.validarPassword(this.password)) {
      this.error.set('La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    this.loading.set(true);
    const request: RegisterRequest = {
      nombre: this.nombre,
      correo: this.correo,
      password: this.password
    };

    this.authService.register(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: any) => {
        this.loading.set(false);
        const msg = err?.error?.message || 'Error al registrarse. Intenta nuevamente.';
        this.error.set(msg);
      }
    });
  }
}
