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

export interface AciertosUsuario {
  idUsuario: number;
  nombre: string;
  correo: string;
  totalPronosticosRegistrados: number;
  pronosticosAcertadosResultado: number;
  pronosticosAcertadosMarcadorExacto: number;
  porcentajeAcierto: number;
}

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

  obtenerAciertosUsuario(idPolla?: number, fechaInicio?: string, fechaFin?: string): Observable<ApiResponse<AciertosUsuario[]>> {
    let params = new HttpParams();
    if (idPolla != null) params = params.set('idPolla', idPolla);
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get<ApiResponse<AciertosUsuario[]>>(
      `${environment.apiUrl}/reportes/aciertos`, { params }
    );
  }

  exportarAciertosCsv(idPolla?: number, fechaInicio?: string, fechaFin?: string): Observable<string> {
    let params = new HttpParams();
    if (idPolla != null) params = params.set('idPolla', idPolla);
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get(`${environment.apiUrl}/reportes/aciertos/csv`, { params, responseType: 'text' });
  }

  obtenerActividad(granularidad: string, fechaInicio?: string, fechaFin?: string): Observable<ApiResponse<ActividadPeriodo[]>> {
    let params = new HttpParams().set('granularidad', granularidad);
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get<ApiResponse<ActividadPeriodo[]>>(
      `${environment.apiUrl}/reportes/actividad`, { params }
    );
  }

  exportarActividadCsv(granularidad: string, fechaInicio?: string, fechaFin?: string): Observable<string> {
    let params = new HttpParams().set('granularidad', granularidad);
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get(`${environment.apiUrl}/reportes/actividad/csv`, { params, responseType: 'text' });
  }
}
