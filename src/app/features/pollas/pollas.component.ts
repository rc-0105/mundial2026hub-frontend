import { Component, inject, signal, DestroyRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PollasService } from '../../core/services/pollas.service';
import { Polla, PollaMiembro, PartidoDisponible, Pronostico, PronosticoRequest } from '../../core/models/polla.model';

@Component({
  selector: 'app-pollas',
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="page-container">
      <h1>Pollas</h1>
      <p class="subtitle">Crea tu propia polla o únete a una existente</p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: start;">
        <div class="form-section">
          <h2>Crear nueva polla</h2>
          <p class="section-desc">Ingresa un nombre y obtendrás un código de invitación único.</p>

          <form [formGroup]="createForm" (ngSubmit)="crear()" style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="form-group">
              <label for="nombre">Nombre de la polla</label>
              <input id="nombre" type="text" formControlName="nombre" placeholder="Ej: Polla familiar 2026" maxlength="100" />
              @if (createForm.controls.nombre.invalid && createForm.controls.nombre.touched) {
                <span class="field-error">El nombre es obligatorio</span>
              }
            </div>

            @if (createError()) {
              <div class="error">{{ createError() }}</div>
            }

            <div class="form-actions">
              <button type="submit" class="btn-primary" [disabled]="createLoading() || createForm.invalid">
                @if (createLoading()) { Creando... } @else { Crear polla }
              </button>
            </div>
          </form>

          @if (pollaCreada(); as polla) {
            <div class="success-card" style="margin-top: 1.5rem;">
              <div class="success-icon">🎉</div>
              <h2>¡Polla creada!</h2>
              <p class="success-desc">Código de invitación:</p>
              <div class="code-box">
                <span class="code-text">{{ polla.codigoInvitacion }}</span>
                <button class="btn-copy" (click)="copiarCodigo()">{{ copiado() ? 'Copiado' : 'Copiar' }}</button>
              </div>
              <p class="success-hint">Eres el administrador de esta polla.</p>
            </div>
          }
        </div>

        <div class="form-section">
          <h2>Unirse a una polla</h2>
          <p class="section-desc">Ingresa el código de invitación que te compartieron.</p>

          <form [formGroup]="joinForm" (ngSubmit)="unirse()" style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="form-group">
              <label for="codigo">Código de invitación</label>
              <input id="codigo" type="text" formControlName="codigo" placeholder="Ej: POLLA-A1B2" maxlength="50"
                style="text-transform: uppercase; letter-spacing: 0.1em; font-family: 'Courier New', monospace;" />
              @if (joinForm.controls.codigo.invalid && joinForm.controls.codigo.touched) {
                <span class="field-error">El código es obligatorio</span>
              }
            </div>

            @if (joinError()) {
              <div class="error">{{ joinError() }}</div>
            }

            <div class="form-actions">
              <button type="submit" class="btn-primary" [disabled]="joinLoading() || joinForm.invalid">
                @if (joinLoading()) { Uniéndose... } @else { Unirse a la polla }
              </button>
            </div>
          </form>

          @if (miembro(); as m) {
            <div class="success-card" style="margin-top: 1.5rem;">
              <div class="success-icon">✅</div>
              <h2>¡Te has unido a la polla!</h2>
              <p class="success-desc">
                <strong>{{ m.polla.nombre }}</strong> — Código: {{ m.polla.codigoInvitacion }}
              </p>
              <p class="success-hint">Pronostica los partidos disponibles a continuación.</p>
            </div>

            @if (partidosDisponibles(); as partidos) {
              <div style="margin-top: 1.5rem;">
                <h3 style="font-size: 1rem; font-weight: 600; color: var(--gray-900); margin-bottom: 1rem;">
                  Partidos disponibles para pronosticar ({{ partidos.length }})
                </h3>

                @if (partidos.length === 0) {
                  <div class="empty-state"><p>No hay partidos disponibles para pronosticar en este momento.</p></div>
                } @else {
                  <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    @for (p of partidos; track p.idPartido) {
                      @let pid = p.idPartido;
                      @let prono = pronosticosMap()[pid];
                      <div class="match-card" style="padding: 1rem;">
                        <div class="match-header" style="margin-bottom: 0.5rem;">
                          <span class="phase-badge">{{ p.fase }}</span>
                          <span class="status-badge status-programado">{{ p.estado }}</span>
                        </div>
                        <div class="match-teams" style="margin-bottom: 0.75rem; gap: 1rem;">
                          <div class="team team-local"><span class="team-name" style="font-size: 1rem;">{{ p.seleccionLocal }}</span></div>
                          <div class="score-display" style="font-size: 1.25rem;">
                            @if (prono) {
                              <span class="predicted-score">{{ prono.golesLocal ?? '?' }} - {{ prono.golesVisitante ?? '?' }}</span>
                            } @else {
                              <span class="vs">VS</span>
                            }
                          </div>
                          <div class="team team-visitante"><span class="team-name" style="font-size: 1rem;">{{ p.seleccionVisitante }}</span></div>
                        </div>
                        <div class="match-info" style="margin-bottom: 0.75rem;">
                          <span>{{ p.fechaHora | date:'dd/MM/yyyy HH:mm' }}</span>
                          <span>{{ p.estadio }}, {{ p.ciudad }}</span>
                        </div>

                        <div class="countdown-bar">
                          @if (countdowns()[pid]; as cd) {
                            <span class="countdown-timer" [class.countdown-urgent]="cd.startsWith('0h')">Cierre en: {{ cd }}</span>
                          }
                        </div>

                        @if (prono) {
                          <div class="prediction-result">
                            <span class="prediction-badge">
                              Pronosticaste: {{ prono.golesLocal ?? '?' }} - {{ prono.golesVisitante ?? '?' }} ({{ ganadorLabel(prono.ganadorPronosticado) }})
                            </span>
                            @if (prono.periodoCerrado) {
                              <span class="period-closed">Período cerrado</span>
                            }
                          </div>
                        } @else {
                          <div class="predict-form">
                            <div class="predict-inputs">
                              <div class="predict-group">
                                <label>Local</label>
                                <input type="number" min="0" max="99" placeholder="0"
                                  [value]="formGolesLocal()[pid] ?? ''"
                                  (input)="setGolesLocal(pid, $event)"
                                  [disabled]="predictLoading()[pid]" />
                              </div>
                              <span class="predict-sep">-</span>
                              <div class="predict-group">
                                <label>Visitante</label>
                                <input type="number" min="0" max="99" placeholder="0"
                                  [value]="formGolesVisitante()[pid] ?? ''"
                                  (input)="setGolesVisitante(pid, $event)"
                                  [disabled]="predictLoading()[pid]" />
                              </div>
                            </div>
                            @if (predictError()[pid]; as err) {
                              <div class="field-error" style="text-align: center; margin-top: 0.25rem;">{{ err }}</div>
                            }
                            <button class="btn-predict" (click)="pronosticar(m.polla.idPolla, pid)"
                              [disabled]="predictLoading()[pid] || formGolesLocal()[pid] === undefined || formGolesVisitante()[pid] === undefined">
                              @if (predictLoading()[pid]) { Guardando... } @else { Pronosticar }
                            </button>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .field-error { font-size: 0.8rem; color: #dc2626; margin-top: 0.25rem; display: block; }
    .success-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow);
      text-align: center;
      animation: fadeIn 0.4s ease;
    }
    .success-icon { font-size: 2rem; margin-bottom: 0.5rem; }
    .success-card h2 { font-size: 1.1rem; font-weight: 700; color: var(--gray-900); margin-bottom: 0.35rem; }
    .success-desc { font-size: 0.85rem; color: var(--gray-500); margin-bottom: 0.75rem; }
    .code-box {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--primary-light);
      border: 2px dashed var(--primary);
      border-radius: var(--radius-md);
      padding: 0.75rem 1.25rem;
      margin-bottom: 0.75rem;
    }
    .code-text {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--primary-dark);
      letter-spacing: 0.15em;
      font-family: 'Courier New', monospace;
    }
    .btn-copy {
      padding: 0.35rem 0.85rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-copy:hover { background: var(--primary-dark); }
    .success-hint { font-size: 0.8rem; color: var(--gray-400); }
    .predicted-score {
      font-weight: 800;
      font-size: 1.1rem;
      color: var(--primary-dark);
    }
    .prediction-result {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .prediction-badge {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 600;
    }
    .period-closed {
      font-size: 0.75rem;
      color: var(--gray-500);
      font-style: italic;
    }
    .predict-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .predict-inputs {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }
    .predict-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.2rem;
    }
    .predict-group label {
      font-size: 0.75rem;
      color: var(--gray-500);
      font-weight: 500;
    }
    .predict-group input {
      width: 4rem;
      text-align: center;
      padding: 0.4rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: 1rem;
      font-weight: 700;
    }
    .predict-sep {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--gray-300);
      margin-top: 1.1rem;
    }
    .btn-predict {
      align-self: center;
      padding: 0.4rem 1.25rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-predict:hover:not(:disabled) { background: var(--primary-dark); }
    .btn-predict:disabled { opacity: 0.5; cursor: not-allowed; }
    .countdown-bar {
      display: flex;
      justify-content: center;
      margin-bottom: 0.5rem;
    }
    .countdown-timer {
      font-size: 0.75rem;
      color: var(--gray-500);
      font-weight: 500;
      background: var(--gray-100);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-sm);
    }
    .countdown-urgent {
      color: #dc2626;
      background: #fef2f2;
      font-weight: 700;
      animation: pulse 1s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `]
})
const MINUTOS_CIERRE = 30;

export class PollasComponent {
  private readonly pollasService = inject(PollasService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly createForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
  });

  readonly joinForm = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.maxLength(50)]],
  });

  readonly createLoading = signal(false);
  readonly createError = signal<string | null>(null);
  readonly pollaCreada = signal<Polla | null>(null);
  readonly copiado = signal(false);

  readonly joinLoading = signal(false);
  readonly joinError = signal<string | null>(null);
  readonly miembro = signal<PollaMiembro | null>(null);
  readonly partidosDisponibles = signal<PartidoDisponible[] | null>(null);

  readonly pronosticosMap = signal<Record<number, Pronostico>>({});
  readonly formGolesLocal = signal<Record<number, number>>({});
  readonly formGolesVisitante = signal<Record<number, number>>({});
  readonly predictLoading = signal<Record<number, boolean>>({});
  readonly predictError = signal<Record<number, string>>({});
  readonly countdowns = signal<Record<number, string>>({});

  constructor() {
    const interval = setInterval(() => this.actualizarCountdowns(), 1000);
    this.destroyRef.onDestroy(() => clearInterval(interval));
  }

  crear(): void {
    if (this.createForm.invalid) return;
    this.createLoading.set(true);
    this.createError.set(null);
    this.pollaCreada.set(null);

    this.pollasService.crearPolla(this.createForm.getRawValue().nombre).subscribe({
      next: res => {
        this.pollaCreada.set(res.data);
        this.createForm.reset();
        this.createLoading.set(false);
      },
      error: () => {
        this.createError.set('Error al crear la polla. Intenta nuevamente.');
        this.createLoading.set(false);
      }
    });
  }

  unirse(): void {
    if (this.joinForm.invalid) return;
    const codigo = this.joinForm.getRawValue().codigo.trim().toUpperCase();

    this.joinLoading.set(true);
    this.joinError.set(null);
    this.miembro.set(null);
    this.partidosDisponibles.set(null);
    this.pronosticosMap.set({});

    this.pollasService.unirseAPolla(codigo).subscribe({
      next: res => {
        this.miembro.set(res.data);
        this.joinForm.reset();
        this.joinLoading.set(false);

        const idPolla = res.data.polla.idPolla;
        this.cargarPartidosYPronosticos(idPolla);
      },
      error: err => {
        const msg = err.error?.message || err.message || '';
        if (msg.includes('CODIGO_INVALIDO') || msg.includes('no es valido')) {
          this.joinError.set('El código de invitación no es válido.');
        } else if (msg.includes('MIEMBRO_DUPLICADO') || msg.includes('ya pertenece')) {
          this.joinError.set('Ya eres miembro de esta polla.');
        } else if (msg.includes('POLLA_INACTIVA') || msg.includes('no esta activa')) {
          this.joinError.set('Esta polla ya no está activa.');
        } else {
          this.joinError.set('Error al unirse a la polla. Verifica el código e intenta nuevamente.');
        }
        this.joinLoading.set(false);
      }
    });
  }

  private actualizarCountdowns(): void {
    const partidos = this.partidosDisponibles();
    if (!partidos || partidos.length === 0) return;
    const now = Date.now();
    const result: Record<number, string> = {};
    for (const p of partidos) {
      const deadline = new Date(p.fechaHora).getTime() - MINUTOS_CIERRE * 60 * 1000;
      const diff = deadline - now;
      if (diff <= 0) {
        result[p.idPartido] = 'Cerrando...';
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        result[p.idPartido] = `${h}h ${m}m ${s}s`;
      }
    }
    this.countdowns.set(result);
  }

  private cargarPartidosYPronosticos(idPolla: number): void {
    this.pollasService.obtenerPartidosDisponibles(idPolla).subscribe({
      next: partidosRes => this.partidosDisponibles.set(partidosRes.data),
      error: () => this.partidosDisponibles.set([])
    });
    this.pollasService.obtenerPronosticos(idPolla).subscribe({
      next: pronosRes => {
        const map: Record<number, Pronostico> = {};
        for (const prono of pronosRes.data) {
          map[prono.partido.idPartido] = prono;
        }
        this.pronosticosMap.set(map);
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

  setGolesLocal(partidoId: number, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.formGolesLocal.update(m => ({ ...m, [partidoId]: val === '' ? undefined : Number(val) }));
    this.predictError.update(m => { const n = { ...m }; delete n[partidoId]; return n; });
  }

  setGolesVisitante(partidoId: number, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.formGolesVisitante.update(m => ({ ...m, [partidoId]: val === '' ? undefined : Number(val) }));
    this.predictError.update(m => { const n = { ...m }; delete n[partidoId]; return n; });
  }

  ganadorLabel(ganador: 'LOCAL' | 'VISITANTE' | 'EMPATE'): string {
    switch (ganador) {
      case 'LOCAL': return 'Local gana';
      case 'VISITANTE': return 'Visitante gana';
      case 'EMPATE': return 'Empate';
    }
  }

  pronosticar(idPolla: number, idPartido: number): void {
    const golesLocal = this.formGolesLocal()[idPartido];
    const golesVisitante = this.formGolesVisitante()[idPartido];

    if (golesLocal === undefined || golesVisitante === undefined) {
      this.predictError.update(m => ({ ...m, [idPartido]: 'Ingresa el marcador completo.' }));
      return;
    }

    let ganador: 'LOCAL' | 'VISITANTE' | 'EMPATE';
    if (golesLocal > golesVisitante) {
      ganador = 'LOCAL';
    } else if (golesVisitante > golesLocal) {
      ganador = 'VISITANTE';
    } else {
      ganador = 'EMPATE';
    }

    this.predictLoading.update(m => ({ ...m, [idPartido]: true }));
    this.predictError.update(m => { const n = { ...m }; delete n[idPartido]; return n; });

    const request: PronosticoRequest = { golesLocal, golesVisitante, ganadorPronosticado: ganador };

    this.pollasService.registrarPronostico(idPolla, idPartido, request).subscribe({
      next: res => {
        this.pronosticosMap.update(m => ({ ...m, [idPartido]: res.data }));
        this.formGolesLocal.update(m => { const n = { ...m }; delete n[idPartido]; return n; });
        this.formGolesVisitante.update(m => { const n = { ...m }; delete n[idPartido]; return n; });
        this.predictLoading.update(m => { const n = { ...m }; delete n[idPartido]; return n; });
      },
      error: err => {
        const msg = err.error?.message || err.message || '';
        this.predictError.update(m => ({ ...m, [idPartido]: msg || 'Error al registrar pronóstico.' }));
        this.predictLoading.update(m => { const n = { ...m }; delete n[idPartido]; return n; });
      }
    });
  }
}
