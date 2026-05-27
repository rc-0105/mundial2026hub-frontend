import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Polla, EventoAuditoria } from '../models/polla.model';

@Injectable({ providedIn: 'root' })
export class PollasService {
  private readonly http = inject(HttpClient);

  crearPolla(nombre: string): Observable<ApiResponse<Polla>> {
    return this.http.post<ApiResponse<Polla>>(`${environment.apiUrl}/pollas`, { nombre });
  }

  obtenerAuditoriaDePolla(idPolla: number): Observable<ApiResponse<EventoAuditoria[]>> {
    return this.http.get<ApiResponse<EventoAuditoria[]>>(
      `${environment.apiUrl}/pollas/${idPolla}/auditoria`
    );
  }
}
