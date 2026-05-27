import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface ReporteAdopcion {
  totalUsuariosRegistrados: number;
  totalUsuariosApostadores: number;
  porcentajeParticipacion: number;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);

  obtenerAdopcion(fechaInicio?: string, fechaFin?: string): Observable<ApiResponse<ReporteAdopcion>> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get<ApiResponse<ReporteAdopcion>>(`${environment.apiUrl}/reportes/adopcion`, { params });
  }

  exportarAdopcionCsv(fechaInicio?: string, fechaFin?: string): Observable<string> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get(`${environment.apiUrl}/reportes/adopcion/csv`, {
      params,
      responseType: 'text',
    });
  }
}
