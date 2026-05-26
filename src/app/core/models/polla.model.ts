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
