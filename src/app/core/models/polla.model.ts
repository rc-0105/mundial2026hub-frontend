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

export interface PollaMiembro {
  idMiembro: number;
  polla: Polla;
  usuario: PollaAdmin;
  puntaje: number;
  fechaUnion: string;
  premioDigital: string | null;
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
  estado: string;
}

export interface PronosticoRequest {
  golesLocal: number | null;
  golesVisitante: number | null;
  ganadorPronosticado: 'LOCAL' | 'VISITANTE' | 'EMPATE';
}

export interface Pronostico {
  idPronostico: number;
  golesLocal: number | null;
  golesVisitante: number | null;
  ganadorPronosticado: 'LOCAL' | 'VISITANTE' | 'EMPATE';
  partido: { idPartido: number };
  fechaRegistro: string;
  periodoCerrado: boolean;
}
