import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PreferenciasUsuario, UpdatePreferenciasRequest, OnboardingRequest } from '../models/preferencias.model';

@Injectable({ providedIn: 'root' })
export class PreferenciasService {
  private readonly http = inject(HttpClient);

  getPreferencias(): Observable<ApiResponse<PreferenciasUsuario>> {
    return this.http.get<ApiResponse<PreferenciasUsuario>>(`${environment.apiUrl}/preferencias/me`);
  }

  updatePreferencias(request: UpdatePreferenciasRequest): Observable<ApiResponse<PreferenciasUsuario>> {
    return this.http.put<ApiResponse<PreferenciasUsuario>>(`${environment.apiUrl}/preferencias/me`, request);
  }

  completarOnboarding(request: OnboardingRequest): Observable<ApiResponse<PreferenciasUsuario>> {
    return this.http.post<ApiResponse<PreferenciasUsuario>>(`${environment.apiUrl}/onboarding`, request);
  }
}
