export interface SeleccionInfo {
  idSeleccion: number | null;
  nombre: string;
  bandera: string | null;
}

export interface EstadioInfo {
  idEstadio: number | null;
  nombre: string;
  ciudad: string;
}

export interface Partido {
  idPartido: number;
  seleccionLocal: SeleccionInfo;
  seleccionVisitante: SeleccionInfo;
  marcadorLocal: number | null;
  marcadorVisitante: number | null;
  estado: 'PROGRAMADO' | 'EN_JUEGO' | 'FINALIZADO';
  estadio: EstadioInfo;
  fase: string;
  fecha: string;
}

export interface PartidoApiResponse {
  status: 'success' | 'error';
  fuente: 'API_EXTERNA' | 'CACHE_LOCAL';
  actualizacionPendiente: boolean;
  data: Partido[];
  timestamp: string;
}

export interface EventoPartido {
  idEvento: number;
  minuto: number;
  tipo: 'GOL' | 'TARJETA_AMARILLA' | 'TARJETA_ROJA' | 'SUSTITUCION';
  jugador: string;
  equipo: 'LOCAL' | 'VISITANTE';
  descripcion: string | null;
}

export interface Sustitucion {
  minuto: number;
  sale: string;
  entra: string;
  equipo: 'LOCAL' | 'VISITANTE';
}

export interface PartidoDetalle extends Partido {
  eventos?: EventoPartido[];
  sustituciones?: Sustitucion[];
  posesionLocal?: number | null;
  posesionVisitante?: number | null;
}
