import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Polla, PollaMiembroWinner } from '../models/polla.model';

@Injectable({ providedIn: 'root' })
export class PollasService {
  private readonly http = inject(HttpClient);

  crearPolla(nombre: string): Observable<ApiResponse<Polla>> {
    return this.http.post<ApiResponse<Polla>>(`${environment.apiUrl}/pollas`, { nombre });
  }

  finalizarPolla(idPolla: number): Observable<ApiResponse<PollaMiembroWinner[]>> {
    return this.http.post<ApiResponse<PollaMiembroWinner[]>>(
      `${environment.apiUrl}/pollas/${idPolla}/finalizar`, {}
    );
  }
}
