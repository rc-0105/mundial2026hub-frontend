import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PartidoApiResponse, PartidoDetalle } from '../models/partido.model';

@Injectable({ providedIn: 'root' })
export class PartidosService {
  private readonly http = inject(HttpClient);

  getPartidos(): Observable<PartidoApiResponse> {
    return this.http.get<PartidoApiResponse>(`${environment.apiUrl}/partidos`);
  }

  getPartido(id: number): Observable<ApiResponse<PartidoDetalle>> {
    return this.http.get<ApiResponse<PartidoDetalle>>(`${environment.apiUrl}/partidos/${id}/detalles`);
  }

  getPartidoEnVivo(id: number): Observable<ApiResponse<PartidoDetalle>> {
    return this.http.get<ApiResponse<PartidoDetalle>>(`${environment.apiUrl}/partidos/${id}/en-vivo`);
  }

}
