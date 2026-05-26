export interface UsuarioProfile {
  idUsuario: number;
  nombre: string;
  correo: string;
  avatarUrl: string | null;
  zonaHoraria: string;
  estado: string;
  fechaRegistro: string;
}

export interface UpdateProfileRequest {
  nombre?: string;
  password?: string;
  avatarUrl?: string | null;
  zonaHoraria?: string;
}
