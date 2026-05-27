import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface PartidoMasApostado {
  idPartido: number;
  seleccionLocal: string;
  seleccionVisitante: string;
  fechaHora: string;
  fase: string;
  totalPronosticos: number;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);

  obtenerPartidosMasApostados(
    fase?: string,
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<ApiResponse<PartidoMasApostado[]>> {
    let params = new HttpParams();
    if (fase) params = params.set('fase', fase);
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get<ApiResponse<PartidoMasApostado[]>>(
      `${environment.apiUrl}/reportes/partidos-mas-apostados`, { params }
    );
  }

  exportarPartidosMasApostadosCsv(
    fase?: string,
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<string> {
    let params = new HttpParams();
    if (fase) params = params.set('fase', fase);
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get(`${environment.apiUrl}/reportes/partidos-mas-apostados/csv`, {
      params,
      responseType: 'text',
    });
  }
}
