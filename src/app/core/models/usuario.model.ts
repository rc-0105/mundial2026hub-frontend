export interface UsuarioProfile {
  idUsuario: number;
  nombre: string;
  correo: string;
  avatar: string | null;
  zonaHoraria: string;
  canalesNotificacion: NotificacionChannel[];
}

export interface NotificacionChannel {
  tipo: 'EMAIL' | 'SMS' | 'PUSH';
  activo: boolean;
}

export interface UpdateProfileRequest {
  nombre: string;
  avatar: string | null;
}

export interface UpdatePasswordRequest {
  passwordActual: string;
  passwordNueva: string;
}
