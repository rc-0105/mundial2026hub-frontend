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

export interface RankingGeneralEntry {
  idUsuario: number;
  nombre: string;
  correo: string;
  puntajeTotalAcumulado: number;
  cantidadPollasParticipadas: number;
}

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
    return this.http.get(`${environment.apiUrl}/reportes/adopcion/csv`, { params, responseType: 'text' });
  }

  obtenerRankingGeneral(idPolla?: number): Observable<ApiResponse<RankingGeneralEntry[]>> {
    let params = new HttpParams();
    if (idPolla != null) params = params.set('idPolla', idPolla);
    return this.http.get<ApiResponse<RankingGeneralEntry[]>>(
      `${environment.apiUrl}/reportes/ranking-general`, { params }
    );
  }

  exportarRankingGeneralCsv(idPolla?: number): Observable<string> {
    let params = new HttpParams();
    if (idPolla != null) params = params.set('idPolla', idPolla);
    return this.http.get(`${environment.apiUrl}/reportes/ranking-general/csv`, { params, responseType: 'text' });
  }

  obtenerPartidosMasApostados(fase?: string, fechaInicio?: string, fechaFin?: string): Observable<ApiResponse<PartidoMasApostado[]>> {
    let params = new HttpParams();
    if (fase) params = params.set('fase', fase);
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get<ApiResponse<PartidoMasApostado[]>>(
      `${environment.apiUrl}/reportes/partidos-mas-apostados`, { params }
    );
  }

  exportarPartidosMasApostadosCsv(fase?: string, fechaInicio?: string, fechaFin?: string): Observable<string> {
    let params = new HttpParams();
    if (fase) params = params.set('fase', fase);
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get(`${environment.apiUrl}/reportes/partidos-mas-apostados/csv`, { params, responseType: 'text' });
  }
}
