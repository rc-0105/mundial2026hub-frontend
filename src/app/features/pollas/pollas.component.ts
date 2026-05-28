import { Component, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PollasService } from '../../core/services/pollas.service';
import { Polla, PartidoDisponible } from '../../core/models/polla.model';

interface ApuestaLocal {
  golesLocal: number;
  golesVisitante: number;
}

@Component({
  selector: 'app-pollas',
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="page-container">

      <!-- STEP INDICATOR -->
      <div class="steps-bar">
        <div class="step" [class.active]="step() >= 1" [class.done]="step() > 1">
          <span class="step-num">1</span>
          <span class="step-label">Crear polla</span>
        </div>
        <div class="step-line" [class.done]="step() > 1"></div>
        <div class="step" [class.active]="step() >= 2" [class.done]="step() > 2">
          <span class="step-num">2</span>
          <span class="step-label">Tus apuestas</span>
        </div>
        <div class="step-line" [class.done]="step() > 2"></div>
        <div class="step" [class.active]="step() >= 3">
          <span class="step-num">3</span>
          <span class="step-label">Compartir</span>
        </div>
      </div>

      <!-- ── STEP 1: CREAR POLLA ── -->
      @if (step() === 1) {
        <div class="step-card">
          <h1>Crear polla</h1>
          <p class="subtitle">Dale un nombre a tu polla. Después podrás agregar tus pronósticos antes de compartirla.</p>

          <form [formGroup]="form" (ngSubmit)="crearPolla()" style="display:flex;flex-direction:column;gap:1rem;margin-top:1.5rem;">
            <div class="form-group">
              <label for="nombre">Nombre de la polla</label>
              <input id="nombre" type="text" formControlName="nombre"
                placeholder="Ej: Polla familiar 2026" maxlength="100" />
              @if (form.controls.nombre.invalid && form.controls.nombre.touched) {
                <span class="field-error">El nombre es obligatorio</span>
              }
            </div>

            @if (errorStep1()) {
              <div class="error">{{ errorStep1() }}</div>
            }

            <button type="submit" class="btn-primary" [disabled]="loadingStep1() || form.invalid">
              {{ loadingStep1() ? 'Creando...' : 'Crear y agregar apuestas →' }}
            </button>
          </form>
        </div>
      }

      <!-- ── STEP 2: APUESTAS ── -->
      @if (step() === 2) {
        <div class="step2-header">
          <div>
            <h1>Tus apuestas</h1>
            <p class="subtitle">Elegí los partidos en los que querés apostar y pronosticá el resultado.</p>
          </div>
          <button class="btn-skip" (click)="irACompartir()">
            Continuar sin apostar más →
          </button>
        </div>

        @if (apuestasGuardadas().size > 0) {
          <div class="apuestas-counter">
            ✓ {{ apuestasGuardadas().size }} apuesta{{ apuestasGuardadas().size === 1 ? '' : 's' }} registrada{{ apuestasGuardadas().size === 1 ? '' : 's' }}
          </div>
        }

        @if (loadingPartidos()) {
          <div class="loading">Cargando partidos disponibles...</div>
        } @else if (partidos().length === 0) {
          <div class="empty-state">
            <p>No hay partidos disponibles para apostar en este momento.</p>
            <button class="btn-primary" (click)="irACompartir()">Continuar →</button>
          </div>
        } @else {
          <div class="partidos-grid">
            @for (p of partidos(); track p.idPartido) {
              <div class="partido-bet-card" [class.bet-saved]="apuestasGuardadas().has(p.idPartido)">

                <div class="partido-bet-header">
                  <span class="fase-tag">{{ labelFase(p.fase) }}</span>
                  <span class="fecha-tag">{{ p.fechaHora | date:'dd MMM · HH:mm' }}</span>
                  @if (apuestasGuardadas().has(p.idPartido)) {
                    <span class="saved-badge">✓ Apostado</span>
                  }
                </div>

                <div class="partido-bet-teams">
                  <span class="team-name">{{ p.seleccionLocal }}</span>
                  <div class="score-inputs">
                    <input type="number" min="0" max="99"
                      [value]="getApuesta(p.idPartido).golesLocal"
                      (input)="setGolesLocal(p.idPartido, $event)"
                      class="score-input" />
                    <span class="score-sep">-</span>
                    <input type="number" min="0" max="99"
                      [value]="getApuesta(p.idPartido).golesVisitante"
                      (input)="setGolesVisitante(p.idPartido, $event)"
                      class="score-input" />
                  </div>
                  <span class="team-name">{{ p.seleccionVisitante }}</span>
                </div>

                <div class="resultado-preview">
                  Resultado pronosticado:
                  <strong>{{ labelResultado(p.idPartido) }}</strong>
                </div>

                <div class="partido-bet-footer">
                  <span class="sede-info">{{ p.estadio }}, {{ p.ciudad }}</span>
                  <button class="btn-apostar"
                    [class.btn-apostado]="apuestasGuardadas().has(p.idPartido)"
                    [disabled]="savingId() === p.idPartido"
                    (click)="guardarApuesta(p)">
                    @if (savingId() === p.idPartido) {
                      Guardando...
                    } @else if (apuestasGuardadas().has(p.idPartido)) {
                      Actualizar apuesta
                    } @else {
                      Apostar
                    }
                  </button>
                </div>

                @if (errorApuesta().get(p.idPartido)) {
                  <span class="field-error" style="margin-top:0.25rem;">{{ errorApuesta().get(p.idPartido) }}</span>
                }
              </div>
            }
          </div>

          <div class="step2-footer">
            <button class="btn-primary" (click)="irACompartir()">
              Continuar con el enlace →
            </button>
          </div>
        }
      }

      <!-- ── STEP 3: COMPARTIR ── -->
      @if (step() === 3) {
        <div class="step-card share-card">
          <div class="success-icon">🎉</div>
          <h1>¡Todo listo!</h1>
          <p class="subtitle">
            Creaste la polla <strong>{{ pollaCreada()?.nombre }}</strong>
            @if (apuestasGuardadas().size > 0) {
              con {{ apuestasGuardadas().size }} apuesta{{ apuestasGuardadas().size === 1 ? '' : 's' }} registrada{{ apuestasGuardadas().size === 1 ? '' : 's' }}.
            } @else {
              . Podés agregar apuestas más adelante.
            }
          </p>

          <p class="share-desc">Compartí este código con tus amigos para que se unan:</p>

          <div class="code-box">
            <span class="code-text">{{ pollaCreada()?.codigoInvitacion }}</span>
            <button class="btn-copy" (click)="copiarCodigo()">
              {{ copiado() ? '¡Copiado!' : 'Copiar' }}
            </button>
          </div>

          <div class="invite-link">
            <span class="link-label">O compartí este enlace directo:</span>
            <div class="link-row">
              <input type="text" [value]="pollaCreada()?.enlaceInvitacion" readonly class="link-input" />
              <button class="btn-secondary" (click)="copiarEnlace()">
                {{ enlaceCopiado() ? '¡Copiado!' : 'Copiar enlace' }}
              </button>
            </div>
          </div>

          <div class="share-actions">
            <button class="btn-outline" (click)="volverAApuestas()">← Agregar más apuestas</button>
            <button class="btn-primary" (click)="reiniciar()">Crear otra polla</button>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    /* Steps bar */
    .steps-bar {
      display: flex;
      align-items: center;
      gap: 0;
      margin-bottom: 2.5rem;
      max-width: 480px;
    }
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.3rem;
      flex-shrink: 0;
    }
    .step-num {
      width: 2rem; height: 2rem;
      border-radius: 50%;
      background: var(--gray-200);
      color: var(--gray-500);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 700;
      transition: all 0.2s;
    }
    .step.active .step-num { background: var(--primary); color: white; }
    .step.done .step-num { background: #16a34a; color: white; }
    .step-label { font-size: 0.72rem; color: var(--gray-400); font-weight: 500; white-space: nowrap; }
    .step.active .step-label { color: var(--primary); font-weight: 700; }
    .step-line {
      flex: 1; height: 2px;
      background: var(--gray-200);
      margin: 0 0.5rem;
      margin-bottom: 1rem;
      transition: background 0.2s;
    }
    .step-line.done { background: #16a34a; }

    /* Step cards */
    .step-card {
      max-width: 520px;
    }
    .step-card h1 { font-size: 1.4rem; font-weight: 800; margin-bottom: 0.5rem; }

    /* Step 2 */
    .step2-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .step2-header h1 { font-size: 1.4rem; font-weight: 800; margin-bottom: 0.25rem; }
    .btn-skip {
      padding: 0.55rem 1.25rem;
      background: transparent;
      color: var(--gray-500);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-size: 0.85rem;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }
    .btn-skip:hover { background: var(--gray-50); color: var(--gray-700); }

    .apuestas-counter {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
      border-radius: var(--radius);
      padding: 0.4rem 0.9rem;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
    }

    .partidos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }

    .partido-bet-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .partido-bet-card:hover { box-shadow: var(--shadow); }
    .partido-bet-card.bet-saved {
      border-color: #86efac;
      background: #f0fdf4;
    }

    .partido-bet-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .fase-tag {
      font-size: 0.7rem;
      font-weight: 700;
      background: var(--primary-light);
      color: var(--primary-dark);
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .fecha-tag {
      font-size: 0.75rem;
      color: var(--gray-500);
    }
    .saved-badge {
      margin-left: auto;
      font-size: 0.72rem;
      font-weight: 700;
      color: #15803d;
      background: #dcfce7;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-sm);
    }

    .partido-bet-teams {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .team-name {
      flex: 1;
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--gray-900);
    }
    .team-name:last-child { text-align: right; }
    .score-inputs {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      flex-shrink: 0;
    }
    .score-input {
      width: 2.4rem;
      text-align: center;
      padding: 0.35rem 0.25rem;
      border: 2px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: 1rem;
      font-weight: 700;
      color: var(--gray-900);
      background: var(--surface);
      -moz-appearance: textfield;
    }
    .score-input::-webkit-inner-spin-button,
    .score-input::-webkit-outer-spin-button { -webkit-appearance: none; }
    .score-input:focus { border-color: var(--primary); outline: none; }
    .score-sep { font-weight: 700; color: var(--gray-400); }

    .resultado-preview {
      font-size: 0.78rem;
      color: var(--gray-500);
      text-align: center;
    }
    .resultado-preview strong { color: var(--primary-dark); }

    .partido-bet-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .sede-info { font-size: 0.75rem; color: var(--gray-400); }
    .btn-apostar {
      padding: 0.45rem 1rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius);
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s;
      white-space: nowrap;
    }
    .btn-apostar:hover:not(:disabled) { background: var(--primary-dark); }
    .btn-apostar.btn-apostado { background: #15803d; }
    .btn-apostar.btn-apostado:hover:not(:disabled) { background: #166534; }
    .btn-apostar:disabled { opacity: 0.55; cursor: not-allowed; }

    .step2-footer {
      margin-top: 2rem;
      display: flex;
      justify-content: flex-end;
    }

    /* Step 3 - share */
    .share-card { text-align: center; }
    .success-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
    .share-card h1 { font-size: 1.5rem; font-weight: 800; }
    .share-desc { font-size: 0.9rem; color: var(--gray-600); margin: 1.5rem 0 0.75rem; }
    .code-box {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--primary-light);
      border: 2px dashed var(--primary);
      border-radius: var(--radius-md);
      padding: 1rem 1.5rem;
      margin-bottom: 1.5rem;
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
      transition: background 0.15s;
    }
    .btn-copy:hover { background: var(--primary-dark); }
    .invite-link { margin-bottom: 1.5rem; }
    .link-label { display: block; font-size: 0.82rem; color: var(--gray-400); margin-bottom: 0.5rem; }
    .link-row { display: flex; gap: 0.5rem; text-align: left; }
    .link-input {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-size: 0.78rem;
      color: var(--gray-600);
      background: var(--gray-50);
    }
    .share-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 1.5rem;
    }

    .field-error { font-size: 0.78rem; color: #dc2626; display: block; }
    .btn-outline {
      padding: 0.55rem 1.25rem;
      background: transparent;
      color: var(--primary);
      border: 1px solid var(--primary);
      border-radius: var(--radius);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-outline:hover { background: var(--primary-light); }
    .btn-secondary {
      padding: 0.5rem 1rem;
      background: var(--gray-100);
      color: var(--gray-700);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s;
    }
    .btn-secondary:hover { background: var(--gray-200); }
  `]
})
export class PollasComponent {
  private readonly pollasService = inject(PollasService);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
  });

  readonly step = signal<1 | 2 | 3>(1);
  readonly pollaCreada = signal<Polla | null>(null);

  // Step 1
  readonly loadingStep1 = signal(false);
  readonly errorStep1 = signal<string | null>(null);

  // Step 2
  readonly loadingPartidos = signal(false);
  readonly partidos = signal<PartidoDisponible[]>([]);
  readonly savingId = signal<number | null>(null);
  readonly apuestasGuardadas = signal<Set<number>>(new Set());
  readonly errorApuesta = signal<Map<number, string>>(new Map());

  // Map idPartido → apuesta local (aún no guardada)
  private readonly apuestasLocales = new Map<number, ApuestaLocal>();

  // Step 3
  readonly copiado = signal(false);
  readonly enlaceCopiado = signal(false);

  // ── Step 1 ──────────────────────────────────
  crearPolla(): void {
    if (this.form.invalid) return;
    this.loadingStep1.set(true);
    this.errorStep1.set(null);

    this.pollasService.crearPolla(this.form.getRawValue().nombre).subscribe({
      next: res => {
        this.pollaCreada.set(res.data);
        this.form.reset();
        this.loadingStep1.set(false);
        this.step.set(2);
        this.cargarPartidos(res.data.idPolla);
      },
      error: () => {
        this.errorStep1.set('Error al crear la polla. Intentá nuevamente.');
        this.loadingStep1.set(false);
      }
    });
  }

  // ── Step 2 ──────────────────────────────────
  private cargarPartidos(idPolla: number): void {
    this.loadingPartidos.set(true);
    this.pollasService.getPartidosDisponibles(idPolla).subscribe({
      next: res => {
        this.partidos.set(res.data);
        this.loadingPartidos.set(false);
      },
      error: () => this.loadingPartidos.set(false)
    });
  }

  getApuesta(idPartido: number): ApuestaLocal {
    if (!this.apuestasLocales.has(idPartido)) {
      this.apuestasLocales.set(idPartido, { golesLocal: 0, golesVisitante: 0 });
    }
    return this.apuestasLocales.get(idPartido)!;
  }

  setGolesLocal(idPartido: number, event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.apuestasLocales.set(idPartido, {
      ...this.getApuesta(idPartido),
      golesLocal: isNaN(val) ? 0 : Math.max(0, val),
    });
  }

  setGolesVisitante(idPartido: number, event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.apuestasLocales.set(idPartido, {
      ...this.getApuesta(idPartido),
      golesVisitante: isNaN(val) ? 0 : Math.max(0, val),
    });
  }

  labelResultado(idPartido: number): string {
    const a = this.getApuesta(idPartido);
    if (a.golesLocal > a.golesVisitante) return 'Gana local';
    if (a.golesVisitante > a.golesLocal) return 'Gana visitante';
    return 'Empate';
  }

  guardarApuesta(partido: PartidoDisponible): void {
    const polla = this.pollaCreada();
    if (!polla) return;

    const a = this.getApuesta(partido.idPartido);
    const ganador = a.golesLocal > a.golesVisitante ? 'LOCAL'
      : a.golesVisitante > a.golesLocal ? 'VISITANTE'
      : 'EMPATE';

    this.savingId.set(partido.idPartido);

    this.pollasService.registrarPronostico(polla.idPolla, partido.idPartido, {
      golesLocal: a.golesLocal,
      golesVisitante: a.golesVisitante,
      ganadorPronosticado: ganador,
    }).subscribe({
      next: () => {
        this.savingId.set(null);
        const saved = new Set(this.apuestasGuardadas());
        saved.add(partido.idPartido);
        this.apuestasGuardadas.set(saved);
        const errs = new Map(this.errorApuesta());
        errs.delete(partido.idPartido);
        this.errorApuesta.set(errs);
      },
      error: () => {
        this.savingId.set(null);
        const errs = new Map(this.errorApuesta());
        errs.set(partido.idPartido, 'Error al guardar. Intentá de nuevo.');
        this.errorApuesta.set(errs);
      }
    });
  }

  irACompartir(): void { this.step.set(3); }
  volverAApuestas(): void { this.step.set(2); }

  // ── Step 3 ──────────────────────────────────
  copiarCodigo(): void {
    const c = this.pollaCreada()?.codigoInvitacion;
    if (!c) return;
    navigator.clipboard.writeText(c).then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2000);
    });
  }

  copiarEnlace(): void {
    const e = this.pollaCreada()?.enlaceInvitacion;
    if (!e) return;
    navigator.clipboard.writeText(e).then(() => {
      this.enlaceCopiado.set(true);
      setTimeout(() => this.enlaceCopiado.set(false), 2000);
    });
  }

  reiniciar(): void {
    this.pollaCreada.set(null);
    this.partidos.set([]);
    this.apuestasGuardadas.set(new Set());
    this.apuestasLocales.clear();
    this.errorApuesta.set(new Map());
    this.step.set(1);
  }

  labelFase(fase: string): string {
    const labels: Record<string, string> = {
      GRUPOS: 'Grupos', OCTAVOS: 'Octavos', CUARTOS: 'Cuartos',
      SEMIFINAL: 'Semi', TERCER_PUESTO: '3er puesto', FINAL: 'Final',
    };
    return labels[fase] || fase;
  }
}
