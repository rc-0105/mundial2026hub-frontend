import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface AciertosUsuario {
  idUsuario: number;
  nombre: string;
  correo: string;
  totalPronosticosRegistrados: number;
  pronosticosAcertadosResultado: number;
  pronosticosAcertadosMarcadorExacto: number;
  porcentajeAcierto: number;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);

  obtenerAciertosUsuario(
    idPolla?: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<ApiResponse<AciertosUsuario[]>> {
    let params = new HttpParams();
    if (idPolla != null) params = params.set('idPolla', idPolla);
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get<ApiResponse<AciertosUsuario[]>>(
      `${environment.apiUrl}/reportes/aciertos`, { params }
    );
  }

  exportarAciertosCsv(
    idPolla?: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<string> {
    let params = new HttpParams();
    if (idPolla != null) params = params.set('idPolla', idPolla);
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get(`${environment.apiUrl}/reportes/aciertos/csv`, {
      params,
      responseType: 'text',
    });
  }
}
