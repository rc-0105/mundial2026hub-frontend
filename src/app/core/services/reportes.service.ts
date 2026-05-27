import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface RankingGeneralEntry {
  idUsuario: number;
  nombre: string;
  correo: string;
  puntajeTotalAcumulado: number;
  cantidadPollasParticipadas: number;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);

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
    return this.http.get(`${environment.apiUrl}/reportes/ranking-general/csv`, {
      params,
      responseType: 'text',
    });
  }
}
