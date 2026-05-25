import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/services/auth.service';
import { AuthRequest } from '../../../core/auth/models/auth-request.model';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  correo = '';
  password = '';

  login(): void {
    this.error.set(null);
    if (!this.correo || !this.password) {
      this.error.set('Correo y contraseña son requeridos.');
      return;
    }

    this.loading.set(true);
    const request: AuthRequest = { correo: this.correo, password: this.password };

    this.authService.login(request).subscribe({
      next: (response: any) => {
        this.loading.set(false);
        if (response.requiereOnboarding) {
          this.router.navigate(['/onboarding']);
        } else {
          this.router.navigate(['/agenda']);
        }
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set('Correo o contraseña inválidos.');
      }
    });
  }
}
