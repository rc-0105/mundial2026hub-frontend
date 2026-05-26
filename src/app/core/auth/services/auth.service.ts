import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { StorageService } from '../../services/storage.service';
import { AuthRequest } from '../models/auth-request.model';
import { AuthResponse } from '../models/auth-response.model';
import { RegisterRequest } from '../models/register-request.model';
import { RegisterResponse } from '../models/register-response.model';
import { ApiResponse } from '../../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);

  private readonly _authUser = signal<AuthResponse | null>(
    this.storage.getUser<AuthResponse>()
  );

  readonly currentUser = this._authUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._authUser());
  readonly requiresOnboarding = computed(() => this._authUser()?.requiereOnboarding ?? false);

  login(request: AuthRequest) {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, request)
      .pipe(
        map(res => res.data),
        tap(response => {
          this.storage.setToken(response.token);
          this.storage.setUser(response);
          this._authUser.set(response);
        })
      );
  }

  register(request: RegisterRequest) {
    return this.http.post<ApiResponse<RegisterResponse>>(
      `${environment.apiUrl}/usuarios/registro`,
      request
    );
  }

  logout() {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({ error: () => {} });
    this.storage.clear();
    this._authUser.set(null);
    this.router.navigate(['/login']);
  }

  onboardingCompleted(): void {
    const user = this._authUser();
    if (user) {
      const updated: AuthResponse = { ...user, requiereOnboarding: false, redirectUrl: '/agenda' };
      this.storage.setUser(updated);
      this._authUser.set(updated);
    }
  }

  updateProfile(nombre: string): void {
    const user = this._authUser();
    if (user) {
      const updated: AuthResponse = { ...user, nombre };
      this.storage.setUser(updated);
      this._authUser.set(updated);
    }
  }
}
