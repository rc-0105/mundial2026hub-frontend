import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Partido, PartidoDetalle } from '../models/partido.model';

@Injectable({ providedIn: 'root' })
export class PartidosService {
  private readonly http = inject(HttpClient);

  getPartidos(): Observable<ApiResponse<Partido[]>> {
    return this.http.get<ApiResponse<Partido[]>>(`${environment.apiUrl}/partidos`);
  }

  getPartido(id: number): Observable<ApiResponse<PartidoDetalle>> {
    return this.http.get<ApiResponse<PartidoDetalle>>(`${environment.apiUrl}/partidos/${id}`);
  }

  getEventosPartido(id: number): Observable<ApiResponse<PartidoDetalle>> {
    return this.http.get<ApiResponse<PartidoDetalle>>(`${environment.apiUrl}/partidos/${id}/eventos`);
  }

  getAgenda(): Observable<ApiResponse<Partido[]>> {
    return this.http.get<ApiResponse<Partido[]>>(`${environment.apiUrl}/agenda`);
  }
}
