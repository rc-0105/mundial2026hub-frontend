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

export interface PollaMiembroWinner {
  idMiembro: number;
  usuario: { idUsuario: number; nombre: string; correo: string };
  puntaje: number;
  premioDigital: string | null;
  fechaUnion: string;
}
