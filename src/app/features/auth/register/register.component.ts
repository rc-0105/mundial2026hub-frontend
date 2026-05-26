import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/auth/services/auth.service';
import { RegisterRequest } from '../../../core/auth/models/register-request.model';
import { passwordStrengthValidator, passwordMatchValidator } from './register.validators';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      password: ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  onSubmit(): void {
    if (this.form.invalid || this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { nombre, correo, password } = this.form.getRawValue();
    let zonaHoraria: string | undefined;
    try { zonaHoraria = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { /* omit if unavailable */ }

    const request: RegisterRequest = { nombre, correo, password, zonaHoraria };

    this.auth.register(request).subscribe({
      next: () => this.router.navigate(['/login'], { queryParams: { registered: true } }),
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (this.isCorreoDuplicado(err)) {
          this.form.get('correo')!.setErrors({ duplicado: true });
        } else {
          this.errorMessage.set('Ocurrió un error. Intentá de nuevo más tarde.');
        }
      },
    });
  }

  private isCorreoDuplicado(err: HttpErrorResponse): boolean {
    const msg: string = err.error?.message ?? '';
    const code: string = err.error?.data?.code ?? '';
    return msg.includes('CORREO_DUPLICADO') || code === 'CORREO_DUPLICADO';
  }
}
