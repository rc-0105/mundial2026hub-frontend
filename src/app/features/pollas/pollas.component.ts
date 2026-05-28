import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PollasService } from '../../core/services/pollas.service';
import { Polla, PollaSummary, PartidoDisponible } from '../../core/models/polla.model';

type Vista = 'lista' | 'crear';
type StepCrear = 1 | 2 | 3;

interface ApuestaLocal {
  golesLocal: number;
  golesVisitante: number;
}

@Component({
  selector: 'app-pollas',
  imports: [ReactiveFormsModule, DatePipe, RouterLink],
  template: `
    <div class="page-container">

      <!-- ════════════════════════════════════════
           VISTA: LISTA DE MIS POLLAS
      ════════════════════════════════════════ -->
      @if (vista() === 'lista') {
        <div class="lista-header">
          <div>
            <h1>Mis Pollas</h1>
            <p class="subtitle">Pollas que has creado y administrás</p>
          </div>
          <button class="btn-primary" (click)="abrirCrear()">+ Crear nueva polla</button>
        </div>

        @if (loadingLista()) {
          <div class="loading">Cargando pollas...</div>
        } @else if (misPollas().length === 0) {
          <div class="empty-lista">
            <div class="empty-icon">🏆</div>
            <h2>Todavía no creaste ninguna polla</h2>
            <p>Creá tu primera polla, agregá tus apuestas y compartila con tus amigos.</p>
            <button class="btn-primary" (click)="abrirCrear()">+ Crear primera polla</button>
          </div>
        } @else {
          <div class="pollas-grid">
            @for (p of misPollas(); track p.idPolla) {
              <div class="polla-card" [class.finalizada]="p.estado === 'FINALIZADA'">
                <div class="polla-card-header">
                  <h3 class="polla-nombre">{{ p.nombre }}</h3>
                  <span class="estado-badge" [class.activa]="p.estado === 'ACTIVA'" [class.fin]="p.estado === 'FINALIZADA'">
                    {{ p.estado === 'ACTIVA' ? 'Activa' : 'Finalizada' }}
                  </span>
                </div>

                <div class="polla-code-row">
                  <span class="polla-code">{{ p.codigoInvitacion }}</span>
                  <button class="btn-icon-copy" (click)="copiarCodigo(p)" [title]="'Copiar código'">
                    {{ codigoCopiado() === p.idPolla ? '✓' : '⎘' }}
                  </button>
                </div>

                <div class="polla-fecha">Creada el {{ p.fechaCreacion | date:'dd/MM/yyyy' }}</div>

                <div class="polla-actions">
                  <a [routerLink]="['/pollas', p.idPolla]" class="btn-entrar">Entrar →</a>
                  <button class="btn-link-copy" (click)="copiarEnlace(p)">
                    {{ enlaceCopiado() === p.idPolla ? '✓ Copiado' : 'Copiar enlace' }}
                  </button>
                </div>
              </div>
            }
          </div>
        }
      }

      <!-- ════════════════════════════════════════
           VISTA: CREAR NUEVA POLLA (3 pasos)
      ════════════════════════════════════════ -->
      @if (vista() === 'crear') {
        <div class="crear-topbar">
          <button class="btn-back" (click)="volverALista()">← Volver a mis pollas</button>
        </div>

        <!-- Step indicator -->
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

        <!-- PASO 1 -->
        @if (step() === 1) {
          <div class="step-card">
            <h1>Nueva polla</h1>
            <p class="subtitle">Dale un nombre a tu polla y después podrás agregar tus pronósticos.</p>

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

        <!-- PASO 2 -->
        @if (step() === 2) {
          <div class="step2-header">
            <div>
              <h1>Tus apuestas</h1>
              <p class="subtitle">Elegí los partidos en los que querés apostar y pronosticá el resultado.</p>
            </div>
            <button class="btn-skip" (click)="irACompartir()">Continuar sin apostar más →</button>
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
                    <span class="team-name team-right">{{ p.seleccionVisitante }}</span>
                  </div>

                  <div class="resultado-preview">
                    Resultado: <strong>{{ labelResultado(p.idPartido) }}</strong>
                  </div>

                  <div class="partido-bet-footer">
                    <span class="sede-info">{{ p.estadio }}, {{ p.ciudad }}</span>
                    <button class="btn-apostar"
                      [class.btn-apostado]="apuestasGuardadas().has(p.idPartido)"
                      [disabled]="savingId() === p.idPartido"
                      (click)="guardarApuesta(p)">
                      @if (savingId() === p.idPartido) { Guardando... }
                      @else if (apuestasGuardadas().has(p.idPartido)) { Actualizar }
                      @else { Apostar }
                    </button>
                  </div>

                  @if (errorApuesta().get(p.idPartido)) {
                    <span class="field-error">{{ errorApuesta().get(p.idPartido) }}</span>
                  }
                </div>
              }
            </div>

            <div class="step2-footer">
              <button class="btn-primary" (click)="irACompartir()">Continuar con el enlace →</button>
            </div>
          }
        }

        <!-- PASO 3 -->
        @if (step() === 3) {
          <div class="step-card share-card">
            <div class="success-icon">🎉</div>
            <h1>¡Todo listo!</h1>
            <p class="subtitle">
              Polla <strong>{{ pollaCreada()?.nombre }}</strong>
              @if (apuestasGuardadas().size > 0) {
                con {{ apuestasGuardadas().size }} apuesta{{ apuestasGuardadas().size === 1 ? '' : 's' }}.
              } @else { creada. }
            </p>

            <p class="share-desc">Compartí el código con tus amigos para que se unan:</p>

            <div class="code-box">
              <span class="code-text">{{ pollaCreada()?.codigoInvitacion }}</span>
              <button class="btn-copy" (click)="copiarCodigoNueva()">
                {{ copiado() ? '¡Copiado!' : 'Copiar' }}
              </button>
            </div>

            <div class="invite-link">
              <span class="link-label">O compartí este enlace:</span>
              <div class="link-row">
                <input type="text" [value]="pollaCreada()?.enlaceInvitacion" readonly class="link-input" />
                <button class="btn-secondary" (click)="copiarEnlaceNueva()">
                  {{ enlaceCopiado() !== null ? '¡Copiado!' : 'Copiar enlace' }}
                </button>
              </div>
            </div>

            <div class="share-actions">
              <button class="btn-outline" (click)="step.set(2)">← Más apuestas</button>
              <button class="btn-primary" (click)="terminar()">Ver mis pollas</button>
            </div>
          </div>
        }
      }

    </div>
  `,
  styles: [`
    /* ── Lista ── */
    .lista-header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;
    }
    .lista-header h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.25rem; }

    .empty-lista {
      text-align: center; padding: 4rem 2rem;
      background: var(--surface); border: 1px dashed var(--border);
      border-radius: var(--radius-lg); max-width: 460px;
    }
    .empty-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .empty-lista h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; }
    .empty-lista p { font-size: 0.875rem; color: var(--gray-500); margin-bottom: 1.25rem; }

    .pollas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    .polla-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 1.25rem;
      display: flex; flex-direction: column; gap: 0.75rem;
      transition: box-shadow 0.15s;
    }
    .polla-card:hover { box-shadow: var(--shadow); }
    .polla-card.finalizada { opacity: 0.75; }

    .polla-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
    .polla-nombre { font-size: 1rem; font-weight: 700; color: var(--gray-900); margin: 0; }

    .estado-badge {
      padding: 0.15rem 0.6rem; border-radius: var(--radius-sm);
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
      white-space: nowrap; flex-shrink: 0;
    }
    .estado-badge.activa { background: #dcfce7; color: #15803d; }
    .estado-badge.fin { background: var(--gray-100); color: var(--gray-500); }

    .polla-code-row { display: flex; align-items: center; gap: 0.5rem; }
    .polla-code {
      font-family: 'Courier New', monospace; font-size: 1rem; font-weight: 800;
      color: var(--primary-dark); letter-spacing: 0.1em;
    }
    .btn-icon-copy {
      padding: 0.2rem 0.5rem; background: var(--primary-light);
      color: var(--primary-dark); border: none; border-radius: var(--radius-sm);
      font-size: 0.9rem; cursor: pointer; transition: background 0.15s;
    }
    .btn-icon-copy:hover { background: var(--primary); color: white; }

    .polla-fecha { font-size: 0.75rem; color: var(--gray-400); }

    .polla-actions { margin-top: auto; display: flex; gap: 0.5rem; }
    .btn-entrar {
      flex: 1; padding: 0.5rem; background: var(--primary);
      color: white; border: none; border-radius: var(--radius);
      font-size: 0.82rem; font-weight: 700; cursor: pointer;
      text-align: center; text-decoration: none; transition: background 0.15s;
    }
    .btn-entrar:hover { background: var(--primary-dark); }
    .btn-link-copy {
      flex: 1; padding: 0.5rem; background: transparent;
      color: var(--primary); border: 1px solid var(--primary);
      border-radius: var(--radius); font-size: 0.82rem; font-weight: 600;
      cursor: pointer; transition: all 0.15s;
    }
    .btn-link-copy:hover { background: var(--primary-light); }

    /* ── Crear / Steps ── */
    .crear-topbar { margin-bottom: 1.5rem; }
    .btn-back {
      background: none; border: none; color: var(--gray-500);
      font-size: 0.85rem; cursor: pointer; padding: 0;
      transition: color 0.15s;
    }
    .btn-back:hover { color: var(--gray-900); }

    .steps-bar {
      display: flex; align-items: center; margin-bottom: 2.5rem; max-width: 480px;
    }
    .step { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; flex-shrink: 0; }
    .step-num {
      width: 2rem; height: 2rem; border-radius: 50%;
      background: var(--gray-200); color: var(--gray-500);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 700; transition: all 0.2s;
    }
    .step.active .step-num { background: var(--primary); color: white; }
    .step.done .step-num { background: #16a34a; color: white; }
    .step-label { font-size: 0.72rem; color: var(--gray-400); font-weight: 500; white-space: nowrap; }
    .step.active .step-label { color: var(--primary); font-weight: 700; }
    .step-line { flex: 1; height: 2px; background: var(--gray-200); margin: 0 0.5rem; margin-bottom: 1rem; transition: background 0.2s; }
    .step-line.done { background: #16a34a; }

    .step-card { max-width: 520px; }
    .step-card h1 { font-size: 1.4rem; font-weight: 800; margin-bottom: 0.5rem; }

    /* Step 2 */
    .step2-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .step2-header h1 { font-size: 1.4rem; font-weight: 800; margin-bottom: 0.25rem; }
    .btn-skip { padding: 0.55rem 1.25rem; background: transparent; color: var(--gray-500); border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.85rem; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
    .btn-skip:hover { background: var(--gray-50); color: var(--gray-700); }

    .apuestas-counter { display: inline-flex; align-items: center; gap: 0.4rem; background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; border-radius: var(--radius); padding: 0.4rem 0.9rem; font-size: 0.85rem; font-weight: 600; margin-bottom: 1.25rem; }

    .partidos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }

    .partido-bet-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; transition: border-color 0.15s, box-shadow 0.15s; }
    .partido-bet-card:hover { box-shadow: var(--shadow); }
    .partido-bet-card.bet-saved { border-color: #86efac; background: #f0fdf4; }

    .partido-bet-header { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .fase-tag { font-size: 0.7rem; font-weight: 700; background: var(--primary-light); color: var(--primary-dark); padding: 0.15rem 0.5rem; border-radius: var(--radius-sm); text-transform: uppercase; letter-spacing: 0.04em; }
    .fecha-tag { font-size: 0.75rem; color: var(--gray-500); }
    .saved-badge { margin-left: auto; font-size: 0.72rem; font-weight: 700; color: #15803d; background: #dcfce7; padding: 0.15rem 0.5rem; border-radius: var(--radius-sm); }

    .partido-bet-teams { display: flex; align-items: center; gap: 0.75rem; }
    .team-name { flex: 1; font-weight: 600; font-size: 0.88rem; color: var(--gray-900); }
    .team-right { text-align: right; }
    .score-inputs { display: flex; align-items: center; gap: 0.3rem; flex-shrink: 0; }
    .score-input { width: 2.4rem; text-align: center; padding: 0.35rem 0.25rem; border: 2px solid var(--border); border-radius: var(--radius-sm); font-size: 1rem; font-weight: 700; color: var(--gray-900); background: var(--surface); -moz-appearance: textfield; }
    .score-input::-webkit-inner-spin-button, .score-input::-webkit-outer-spin-button { -webkit-appearance: none; }
    .score-input:focus { border-color: var(--primary); outline: none; }
    .score-sep { font-weight: 700; color: var(--gray-400); }

    .resultado-preview { font-size: 0.78rem; color: var(--gray-500); text-align: center; }
    .resultado-preview strong { color: var(--primary-dark); }

    .partido-bet-footer { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap; }
    .sede-info { font-size: 0.75rem; color: var(--gray-400); }
    .btn-apostar { padding: 0.45rem 1rem; background: var(--primary); color: white; border: none; border-radius: var(--radius); font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: background 0.15s; white-space: nowrap; }
    .btn-apostar:hover:not(:disabled) { background: var(--primary-dark); }
    .btn-apostar.btn-apostado { background: #15803d; }
    .btn-apostar.btn-apostado:hover:not(:disabled) { background: #166534; }
    .btn-apostar:disabled { opacity: 0.55; cursor: not-allowed; }

    .step2-footer { margin-top: 2rem; display: flex; justify-content: flex-end; }

    /* Step 3 */
    .share-card { text-align: center; }
    .success-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
    .share-card h1 { font-size: 1.5rem; font-weight: 800; }
    .share-desc { font-size: 0.9rem; color: var(--gray-600); margin: 1.5rem 0 0.75rem; }
    .code-box { display: inline-flex; align-items: center; gap: 0.75rem; background: var(--primary-light); border: 2px dashed var(--primary); border-radius: var(--radius-md); padding: 1rem 1.5rem; margin-bottom: 1.5rem; }
    .code-text { font-size: 1.5rem; font-weight: 800; color: var(--primary-dark); letter-spacing: 0.15em; font-family: 'Courier New', monospace; }
    .btn-copy { padding: 0.4rem 1rem; background: var(--primary); color: white; border: none; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
    .btn-copy:hover { background: var(--primary-dark); }
    .invite-link { margin-bottom: 1.5rem; }
    .link-label { display: block; font-size: 0.82rem; color: var(--gray-400); margin-bottom: 0.5rem; }
    .link-row { display: flex; gap: 0.5rem; text-align: left; }
    .link-input { flex: 1; padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.78rem; color: var(--gray-600); background: var(--gray-50); }
    .share-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-top: 1.5rem; }

    .field-error { font-size: 0.78rem; color: #dc2626; display: block; }
    .btn-outline { padding: 0.55rem 1.25rem; background: transparent; color: var(--primary); border: 1px solid var(--primary); border-radius: var(--radius); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
    .btn-outline:hover { background: var(--primary-light); }
    .btn-secondary { padding: 0.5rem 1rem; background: var(--gray-100); color: var(--gray-700); border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.82rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background 0.15s; }
    .btn-secondary:hover { background: var(--gray-200); }
  `]
})
export class PollasComponent implements OnInit {
  private readonly pollasService = inject(PollasService);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
  });

  // Vista principal
  readonly vista = signal<Vista>('lista');
  readonly misPollas = signal<PollaSummary[]>([]);
  readonly loadingLista = signal(true);
  readonly codigoCopiado = signal<number | null>(null);
  readonly enlaceCopiado = signal<number | null>(null);

  // Creación
  readonly step = signal<StepCrear>(1);
  readonly pollaCreada = signal<Polla | null>(null);
  readonly loadingStep1 = signal(false);
  readonly errorStep1 = signal<string | null>(null);

  // Apuestas
  readonly loadingPartidos = signal(false);
  readonly partidos = signal<PartidoDisponible[]>([]);
  readonly savingId = signal<number | null>(null);
  readonly apuestasGuardadas = signal<Set<number>>(new Set());
  readonly errorApuesta = signal<Map<number, string>>(new Map());
  private readonly apuestasLocales = new Map<number, ApuestaLocal>();

  // Compartir
  readonly copiado = signal(false);

  ngOnInit(): void {
    this.cargarMisPollas();
  }

  // ── Lista ──────────────────────────────────
  private cargarMisPollas(): void {
    this.loadingLista.set(true);
    this.pollasService.getMisPollas().subscribe({
      next: res => {
        this.misPollas.set(res.data);
        this.loadingLista.set(false);
      },
      error: () => this.loadingLista.set(false)
    });
  }

  abrirCrear(): void {
    this.resetCrear();
    this.vista.set('crear');
  }

  volverALista(): void {
    this.vista.set('lista');
    this.cargarMisPollas();
  }

  copiarCodigo(p: PollaSummary): void {
    navigator.clipboard.writeText(p.codigoInvitacion).then(() => {
      this.codigoCopiado.set(p.idPolla);
      setTimeout(() => this.codigoCopiado.set(null), 2000);
    });
  }

  copiarEnlace(p: PollaSummary): void {
    navigator.clipboard.writeText(p.enlaceInvitacion).then(() => {
      this.enlaceCopiado.set(p.idPolla);
      setTimeout(() => this.enlaceCopiado.set(null), 2000);
    });
  }

  // ── Paso 1 ──────────────────────────────────
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

  // ── Paso 2 ──────────────────────────────────
  private cargarPartidos(idPolla: number): void {
    this.loadingPartidos.set(true);
    this.pollasService.getPartidosDisponibles(idPolla).subscribe({
      next: res => { this.partidos.set(res.data); this.loadingPartidos.set(false); },
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
    this.apuestasLocales.set(idPartido, { ...this.getApuesta(idPartido), golesLocal: isNaN(val) ? 0 : Math.max(0, val) });
  }

  setGolesVisitante(idPartido: number, event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.apuestasLocales.set(idPartido, { ...this.getApuesta(idPartido), golesVisitante: isNaN(val) ? 0 : Math.max(0, val) });
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
    const ganador = a.golesLocal > a.golesVisitante ? 'LOCAL' : a.golesVisitante > a.golesLocal ? 'VISITANTE' : 'EMPATE';

    this.savingId.set(partido.idPartido);
    this.pollasService.registrarPronostico(polla.idPolla, partido.idPartido, {
      golesLocal: a.golesLocal, golesVisitante: a.golesVisitante, ganadorPronosticado: ganador,
    }).subscribe({
      next: () => {
        this.savingId.set(null);
        const saved = new Set(this.apuestasGuardadas()); saved.add(partido.idPartido);
        this.apuestasGuardadas.set(saved);
        const errs = new Map(this.errorApuesta()); errs.delete(partido.idPartido);
        this.errorApuesta.set(errs);
      },
      error: () => {
        this.savingId.set(null);
        const errs = new Map(this.errorApuesta()); errs.set(partido.idPartido, 'Error al guardar. Intentá de nuevo.');
        this.errorApuesta.set(errs);
      }
    });
  }

  irACompartir(): void { this.step.set(3); }

  // ── Paso 3 ──────────────────────────────────
  copiarCodigoNueva(): void {
    const c = this.pollaCreada()?.codigoInvitacion;
    if (!c) return;
    navigator.clipboard.writeText(c).then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2000);
    });
  }

  copiarEnlaceNueva(): void {
    const e = this.pollaCreada()?.enlaceInvitacion;
    if (!e) return;
    navigator.clipboard.writeText(e).then(() => {
      this.enlaceCopiado.set(-1);
      setTimeout(() => this.enlaceCopiado.set(null), 2000);
    });
  }

  terminar(): void {
    this.volverALista();
  }

  private resetCrear(): void {
    this.step.set(1);
    this.pollaCreada.set(null);
    this.partidos.set([]);
    this.apuestasGuardadas.set(new Set());
    this.apuestasLocales.clear();
    this.errorApuesta.set(new Map());
    this.errorStep1.set(null);
    this.form.reset();
    this.copiado.set(false);
  }

  labelFase(fase: string): string {
    const labels: Record<string, string> = { GRUPOS: 'Grupos', OCTAVOS: 'Octavos', CUARTOS: 'Cuartos', SEMIFINAL: 'Semi', TERCER_PUESTO: '3er puesto', FINAL: 'Final' };
    return labels[fase] || fase;
  }
}
