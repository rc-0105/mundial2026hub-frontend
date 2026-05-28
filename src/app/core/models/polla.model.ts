export interface Polla {
  idPolla: number;
  nombre: string;
  codigoInvitacion: string;
  enlaceInvitacion: string;
  administrador: PollaAdmin;
  estado: 'ACTIVA' | 'FINALIZADA';
  fechaCreacion: string;
}

export interface PollaAdmin {
  idUsuario: number;
  nombre: string;
  correo: string;
  avatarUrl: string | null;
}

export interface PartidoDisponible {
  idPartido: number;
  seleccionLocal: string;
  seleccionVisitante: string;
  golesLocal: number | null;
  golesVisitante: number | null;
  fechaHora: string;
  estadio: string;
  ciudad: string;
  fase: string;
  estado: 'PROGRAMADO' | 'EN_JUEGO' | 'FINALIZADO';
  provisional: boolean;
}

export interface PronosticoRequest {
  golesLocal: number;
  golesVisitante: number;
  ganadorPronosticado: 'LOCAL' | 'VISITANTE' | 'EMPATE';
}

export interface RankingEntry {
  posicion: number;
  nombre: string;
  correo: string;
  puntaje: number;
  premioDigital: string | null;
}

export interface EventoAuditoria {
  idEvento: number;
  idUsuario: number;
  tipoEvento: string;
  entidadRef: string;
  idEntidad: number;
  detalle: string;
  timestamp: string;
  idCorrelacion: string;
}

export interface PollaMiembroWinner {
  idMiembro: number;
  usuario: { idUsuario: number; nombre: string; correo: string };
  puntaje: number;
  premioDigital: string | null;
  fechaUnion: string;
}
