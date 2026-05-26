import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Polla, PollaMiembro, PartidoDisponible, Pronostico, PronosticoRequest } from '../models/polla.model';

@Injectable({ providedIn: 'root' })
export class PollasService {
  private readonly http = inject(HttpClient);

  crearPolla(nombre: string): Observable<ApiResponse<Polla>> {
    return this.http.post<ApiResponse<Polla>>(`${environment.apiUrl}/pollas`, { nombre });
  }

  unirseAPolla(codigoInvitacion: string): Observable<ApiResponse<PollaMiembro>> {
    return this.http.post<ApiResponse<PollaMiembro>>(`${environment.apiUrl}/pollas/unirse`, { codigoInvitacion });
  }

  obtenerPartidosDisponibles(idPolla: number): Observable<ApiResponse<PartidoDisponible[]>> {
    return this.http.get<ApiResponse<PartidoDisponible[]>>(`${environment.apiUrl}/pollas/${idPolla}/partidos-disponibles`);
  }

  registrarPronostico(idPolla: number, idPartido: number, data: PronosticoRequest): Observable<ApiResponse<Pronostico>> {
    return this.http.post<ApiResponse<Pronostico>>(`${environment.apiUrl}/pollas/${idPolla}/pronosticos/${idPartido}`, data);
  }

  obtenerPronosticos(idPolla: number): Observable<ApiResponse<Pronostico[]>> {
    return this.http.get<ApiResponse<Pronostico[]>>(`${environment.apiUrl}/pollas/${idPolla}/pronosticos`);
  }
}
