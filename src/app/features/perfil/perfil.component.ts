import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { UsuarioProfile } from '../../core/models/usuario.model';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-perfil',
  imports: [FormsModule],
  template: `
    <div class="page-container">
      <h1>Mi Perfil</h1>

      @if (loading()) {
        <div class="loading">Cargando perfil</div>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
      } @else {
        <form (ngSubmit)="guardarPerfil()" style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 560px;">
          <div class="form-section">
            <h2>Información personal</h2>
            <p class="section-desc">Tu nombre y avatar se muestran en toda la plataforma</p>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label for="nombre">Nombre</label>
              <input id="nombre" type="text" [(ngModel)]="nombre" name="nombre" required placeholder="Tu nombre" />
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label for="correo">Correo electrónico</label>
              <input id="correo" type="email" [value]="profile()?.correo" disabled style="background: var(--gray-50); color: var(--gray-400); cursor: not-allowed;" />
              <span class="hint">El correo no se puede modificar</span>
            </div>

            <div class="form-group">
              <label>Avatar</label>
              <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                @if (avatarPreview()) {
                  <img [src]="avatarPreview()" alt="Avatar" class="avatar-img" />
                } @else if (profile()?.avatar) {
                  <img [src]="profile()?.avatar" alt="Avatar" class="avatar-img" />
                } @else {
                  <div class="avatar-placeholder">{{ profile()?.nombre?.charAt(0)?.toUpperCase() }}</div>
                }
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" (change)="onAvatarSelected($event)" #fileInput style="font-size: 0.85rem;" />
              </div>
              <span class="hint">Solo ilustraciones o imágenes generadas, sin fotografías de personas reales</span>
            </div>
          </div>

          <div class="form-section">
            <h2>Cambiar contraseña</h2>
            <p class="section-desc">Dejá los campos en blanco si no querés cambiar tu contraseña</p>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label for="passwordActual">Contraseña actual</label>
              <input id="passwordActual" type="password" [(ngModel)]="passwordActual" name="passwordActual" placeholder="Contraseña actual" />
            </div>
            <div class="form-group">
              <label for="passwordNueva">Nueva contraseña</label>
              <input id="passwordNueva" type="password" [(ngModel)]="passwordNueva" name="passwordNueva" placeholder="Mín. 8 caracteres, una mayúscula y un número" />
            </div>
            @if (passwordError()) {
              <p class="error" style="margin-top: 0.75rem;">{{ passwordError() }}</p>
            }
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="saving()">
              @if (saving()) {
                <span style="display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; vertical-align: middle;"></span>
              }
              {{ saving() ? 'Guardando...' : 'Guardar cambios' }}
            </button>
            @if (successMessage()) {
              <span class="success">{{ successMessage() }}</span>
            }
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .avatar-img {
      width: 80px; height: 80px; border-radius: 50%; object-fit: cover;
      border: 3px solid var(--primary); box-shadow: var(--shadow);
    }
    .avatar-placeholder {
      width: 80px; height: 80px; border-radius: 50%;
      background: var(--red-to-pink-to-purple-gradient);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 2rem; font-weight: 700;
      box-shadow: var(--shadow);
    }
    .hint { font-size: 0.8rem; color: var(--gray-400); margin-top: 0.25rem; }
  `]
})
export class PerfilComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly authService = inject(AuthService);

  readonly profile = signal<UsuarioProfile | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly avatarPreview = signal<string | null>(null);
  readonly passwordError = signal<string | null>(null);

  nombre = '';
  passwordActual = '';
  passwordNueva = '';

  ngOnInit(): void {
    this.cargarPerfil();
  }

  private cargarPerfil(): void {
    this.usuarioService.getProfile().subscribe({
      next: res => {
        this.profile.set(res.data);
        this.nombre = res.data.nombre;
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el perfil.');
        this.loading.set(false);
      }
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      this.error.set('Formato no válido. Use PNG, JPEG, WebP o SVG.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  guardarPerfil(): void {
    this.passwordError.set(null);
    this.successMessage.set(null);
    this.error.set(null);

    if (this.passwordNueva && !this.validarPassword(this.passwordNueva)) {
      this.passwordError.set('La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número.');
      return;
    }

    this.saving.set(true);
    this.usuarioService.updateProfile({ nombre: this.nombre, avatar: this.avatarPreview() }).subscribe({
      next: () => {
        this.authService.updateProfile(this.nombre);
        if (this.passwordActual && this.passwordNueva) {
          this.usuarioService.updatePassword({ passwordActual: this.passwordActual, passwordNueva: this.passwordNueva }).subscribe({
            next: () => {
              this.saving.set(false);
              this.successMessage.set('Perfil y contraseña actualizados.');
              this.passwordActual = '';
              this.passwordNueva = '';
            },
            error: () => {
              this.saving.set(false);
              this.error.set('Error al actualizar la contraseña. Verifique su contraseña actual.');
            }
          });
        } else {
          this.saving.set(false);
          this.successMessage.set('Perfil actualizado correctamente.');
        }
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Error al guardar el perfil.');
      }
    });
  }

  private validarPassword(p: string): boolean {
    return p.length >= 8 && /[A-Z]/.test(p) && /\d/.test(p);
  }
}
