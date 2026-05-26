export interface AuthResponse {
  token: string;
  expiresIn: number;
  idUsuario: number;
  nombre: string;
  correo: string;
  requiereOnboarding: boolean;
  redirectUrl: string;
}
