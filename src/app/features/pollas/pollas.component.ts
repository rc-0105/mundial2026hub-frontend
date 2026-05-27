import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PollasService } from '../../core/services/pollas.service';
import { Polla, PollaMiembroWinner } from '../../core/models/polla.model';

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

          @if (polla.estado === 'ACTIVA') {
            <div class="finalizar-section">
              <button class="btn-danger" (click)="finalizar()" [disabled]="finalizarLoading()">
                @if (finalizarLoading()) {
                  Finalizando...
                } @else {
                  Finalizar polla
                }
              </button>
              <p class="finalizar-hint">Al finalizar la polla se calcularán los ganadores y se otorgarán los premios digitales.</p>
            </div>
          }

          @if (finalizarError()) {
            <div class="error">{{ finalizarError() }}</div>
          }
        </div>

        @if (ganadores(); as ganadores) {
          <div class="prize-section">
            <h2>Premio digital</h2>
            <p class="section-desc">La polla ha finalizado. Los ganadores han recibido su certificado digital de campeón.</p>

            <div class="winners-list">
              @for (g of ganadores; track g.idMiembro) {
                <div class="winner-card">
                  <div class="trophy">🏆</div>
                  <div class="winner-info">
                    <strong class="winner-name">{{ g.usuario.nombre }}</strong>
                    <span class="winner-score">{{ g.puntaje }} puntos</span>
                  </div>
                  <div class="prize-badge">
                    <span class="prize-label">{{ g.premioDigital }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        }
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
    .finalizar-section { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
    .finalizar-hint { font-size: 0.75rem; color: var(--gray-400); margin-top: 0.5rem; }
    .btn-danger {
      padding: 0.6rem 1.5rem;
      background: #dc2626;
      color: white;
      border: none;
      border-radius: var(--radius);
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-danger:hover { background: #b91c1c; }
    .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
    .prize-section {
      max-width: 600px;
      margin-top: 2rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2rem;
      box-shadow: var(--shadow);
      animation: fadeIn 0.4s ease;
    }
    .prize-section h2 { font-size: 1.15rem; font-weight: 700; color: var(--gray-900); margin-bottom: 0.25rem; }
    .winners-list { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
    .winner-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--gray-50);
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }
    .trophy { font-size: 1.5rem; }
    .winner-info { flex: 1; display: flex; flex-direction: column; }
    .winner-name { font-size: 0.95rem; color: var(--gray-900); }
    .winner-score { font-size: 0.8rem; color: var(--gray-500); }
    .prize-badge {
      padding: 0.25rem 0.75rem;
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: var(--radius-sm);
    }
    .prize-label { font-size: 0.7rem; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.03em; }
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

  readonly finalizarLoading = signal(false);
  readonly finalizarError = signal<string | null>(null);
  readonly ganadores = signal<PollaMiembroWinner[] | null>(null);

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

  finalizar(): void {
    const polla = this.pollaCreada();
    if (!polla) return;

    this.finalizarLoading.set(true);
    this.finalizarError.set(null);
    this.ganadores.set(null);

    this.pollasService.finalizarPolla(polla.idPolla).subscribe({
      next: res => {
        this.ganadores.set(res.data);
        this.pollaCreada.set({ ...polla, estado: 'FINALIZADA' });
        this.finalizarLoading.set(false);
      },
      error: () => {
        this.finalizarError.set('Error al finalizar la polla. Solo el administrador puede realizar esta acción.');
        this.finalizarLoading.set(false);
      }
    });
  }
}
