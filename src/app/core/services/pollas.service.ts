import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Polla, PartidoDisponible, PronosticoRequest, RankingEntry, EventoAuditoria, PollaMiembroWinner } from '../models/polla.model';

@Injectable({ providedIn: 'root' })
export class PollasService {
  private readonly http = inject(HttpClient);

  crearPolla(nombre: string): Observable<ApiResponse<Polla>> {
    return this.http.post<ApiResponse<Polla>>(`${environment.apiUrl}/pollas`, { nombre });
  }

  getPartidosDisponibles(idPolla: number): Observable<ApiResponse<PartidoDisponible[]>> {
    return this.http.get<ApiResponse<PartidoDisponible[]>>(
      `${environment.apiUrl}/pollas/${idPolla}/partidos-disponibles`
    );
  }

  registrarPronostico(idPolla: number, idPartido: number, req: PronosticoRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${environment.apiUrl}/pollas/${idPolla}/pronosticos/${idPartido}`, req
    );
  }

  unirseAPolla(codigoInvitacion: string): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${environment.apiUrl}/pollas/unirse`, { codigoInvitacion });
  }

  obtenerRanking(idPolla: number): Observable<ApiResponse<RankingEntry[]>> {
    return this.http.get<ApiResponse<RankingEntry[]>>(`${environment.apiUrl}/pollas/${idPolla}/ranking`);
  }

  obtenerAuditoriaDePolla(idPolla: number): Observable<ApiResponse<EventoAuditoria[]>> {
    return this.http.get<ApiResponse<EventoAuditoria[]>>(
      `${environment.apiUrl}/pollas/${idPolla}/auditoria`
    );
  }

  finalizarPolla(idPolla: number): Observable<ApiResponse<PollaMiembroWinner[]>> {
    return this.http.post<ApiResponse<PollaMiembroWinner[]>>(
      `${environment.apiUrl}/pollas/${idPolla}/finalizar`, {}
    );
  }
}
