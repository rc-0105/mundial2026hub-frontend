import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Notificacion } from '../models/notificacion.model';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private readonly http = inject(HttpClient);

  obtenerMisNotificaciones(): Observable<ApiResponse<Notificacion[]>> {
    return this.http.get<ApiResponse<Notificacion[]>>(`${environment.apiUrl}/notificaciones/mis`);
  }

  obtenerNoLeidas(): Observable<ApiResponse<Notificacion[]>> {
    return this.http.get<ApiResponse<Notificacion[]>>(`${environment.apiUrl}/notificaciones/mis/no-leidas`);
  }
}
