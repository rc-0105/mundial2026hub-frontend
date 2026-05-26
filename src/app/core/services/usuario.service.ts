import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { UsuarioProfile, UpdateProfileRequest, UpdatePasswordRequest } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);

  getProfile(): Observable<ApiResponse<UsuarioProfile>> {
    return this.http.get<ApiResponse<UsuarioProfile>>(`${environment.apiUrl}/usuarios/perfil`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<ApiResponse<UsuarioProfile>> {
    return this.http.put<ApiResponse<UsuarioProfile>>(`${environment.apiUrl}/usuarios/perfil`, request);
  }

  updatePassword(request: UpdatePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${environment.apiUrl}/usuarios/password`, request);
  }
}
