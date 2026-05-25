export interface Partido {
  idPartido: number;
  seleccionLocal: SeleccionInfo;
  seleccionVisitante: SeleccionInfo;
  fecha: string;
  estadio: EstadioInfo;
  fase: string;
  estado: 'PROGRAMADO' | 'EN_JUEGO' | 'FINALIZADO';
  marcadorLocal: number | null;
  marcadorVisitante: number | null;
}

export interface SeleccionInfo {
  idSeleccion: number;
  nombre: string;
  bandera: string | null;
}

export interface EstadioInfo {
  idEstadio: number;
  nombre: string;
  ciudad: string;
}

export interface PartidoDetalle extends Partido {
  eventos: EventoPartido[];
  sustituciones: Sustitucion[];
  posesionLocal: number | null;
  posesionVisitante: number | null;
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

export interface GolInfo {
  minuto: number;
  jugador: string;
  equipo: 'LOCAL' | 'VISITANTE';
  asistencia: string | null;
}
