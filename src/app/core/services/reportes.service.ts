import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface ActividadPeriodo {
  periodo: string;
  nuevosUsuariosRegistrados: number;
  sesionesIniciadas: number;
  pollasCreadas: number;
  pronosticosRegistrados: number;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);

  obtenerActividad(
    granularidad: string,
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<ApiResponse<ActividadPeriodo[]>> {
    let params = new HttpParams().set('granularidad', granularidad);
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get<ApiResponse<ActividadPeriodo[]>>(
      `${environment.apiUrl}/reportes/actividad`, { params }
    );
  }

  exportarActividadCsv(
    granularidad: string,
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<string> {
    let params = new HttpParams().set('granularidad', granularidad);
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get(`${environment.apiUrl}/reportes/actividad/csv`, {
      params,
      responseType: 'text',
    });
  }
}
