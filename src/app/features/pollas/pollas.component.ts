import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PollasService } from '../../core/services/pollas.service';
import { Polla } from '../../core/models/polla.model';

@Component({
  selector: 'app-pollas',
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-container">
      <h1>Pollas</h1>
      <p class="subtitle">Crea tu propia polla y compite con amigos</p>

      <div class="form-section" style="max-width: 560px;">
        <h2>Crear nueva polla</h2>
        <p class="section-desc">Ingresa un nombre para tu polla y obtendrás un código de invitación único.</p>

        <form [formGroup]="form" (ngSubmit)="crear()" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-group">
            <label for="nombre">Nombre de la polla</label>
            <input
              id="nombre"
              type="text"
              formControlName="nombre"
              placeholder="Ej: Polla familiar 2026"
              maxlength="100"
            />
            @if (form.controls.nombre.invalid && form.controls.nombre.touched) {
              <span class="field-error">El nombre es obligatorio</span>
            }
          </div>

          @if (error()) {
            <div class="error">{{ error() }}</div>
          }

          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="loading() || form.invalid">
              @if (loading()) {
                Creando...
              } @else {
                Crear polla
              }
            </button>
          </div>
        </form>
      </div>

      @if (pollaCreada(); as polla) {
        <div class="success-card">
          <div class="success-icon">🎉</div>
          <h2>¡Polla creada exitosamente!</h2>
          <p class="success-desc">Comparte el siguiente código con tus amigos para que se unan:</p>

          <div class="code-box">
            <span class="code-text">{{ polla.codigoInvitacion }}</span>
            <button class="btn-copy" (click)="copiarCodigo()">
              {{ copiado() ? 'Copiado' : 'Copiar' }}
            </button>
          </div>

          <div class="invite-link">
            <span class="link-label">O comparte este enlace:</span>
            <div class="link-row">
              <input type="text" [value]="polla.enlaceInvitacion" readonly class="link-input" />
              <button class="btn-secondary" (click)="copiarEnlace()">
                {{ enlaceCopiado() ? 'Copiado' : 'Copiar enlace' }}
              </button>
            </div>
          </div>

          <p class="success-hint">
            Eres el administrador de esta polla. Podrás finalizarla cuando termine el torneo.
          </p>
        </div>
      }
    </div>
  `,
  styles: [`
    .field-error { font-size: 0.8rem; color: #dc2626; margin-top: 0.25rem; display: block; }
    .success-card {
      max-width: 560px;
      margin-top: 2rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2rem;
      box-shadow: var(--shadow);
      text-align: center;
      animation: fadeIn 0.4s ease;
    }
    .success-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
    .success-card h2 { font-size: 1.25rem; font-weight: 700; color: var(--gray-900); margin-bottom: 0.5rem; }
    .success-desc { font-size: 0.9rem; color: var(--gray-500); margin-bottom: 1.5rem; }
    .code-box {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--primary-light);
      border: 2px dashed var(--primary);
      border-radius: var(--radius-md);
      padding: 1rem 1.5rem;
      margin-bottom: 1.25rem;
    }
    .code-text {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--primary-dark);
      letter-spacing: 0.15em;
      font-family: 'Courier New', monospace;
    }
    .btn-copy {
      padding: 0.4rem 1rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-copy:hover { background: var(--primary-dark); }
    .invite-link { margin-bottom: 1rem; }
    .link-label { display: block; font-size: 0.85rem; color: var(--gray-400); margin-bottom: 0.5rem; }
    .link-row { display: flex; gap: 0.5rem; }
    .link-input {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-size: 0.8rem;
      color: var(--gray-600);
      background: var(--gray-50);
    }
    .success-hint { font-size: 0.8rem; color: var(--gray-400); margin-top: 1rem; }
  `]
})
export class PollasComponent {
  private readonly pollasService = inject(PollasService);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pollaCreada = signal<Polla | null>(null);
  readonly copiado = signal(false);
  readonly enlaceCopiado = signal(false);

  crear(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);
    this.pollaCreada.set(null);

    this.pollasService.crearPolla(this.form.getRawValue().nombre).subscribe({
      next: res => {
        this.pollaCreada.set(res.data);
        this.form.reset();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al crear la polla. Intenta nuevamente.');
        this.loading.set(false);
      }
    });
  }

  copiarCodigo(): void {
    const polla = this.pollaCreada();
    if (!polla) return;
    navigator.clipboard.writeText(polla.codigoInvitacion).then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2000);
    });
  }

  copiarEnlace(): void {
    const polla = this.pollaCreada();
    if (!polla) return;
    navigator.clipboard.writeText(polla.enlaceInvitacion).then(() => {
      this.enlaceCopiado.set(true);
      setTimeout(() => this.enlaceCopiado.set(false), 2000);
    });
  }
}
