export interface AuthResponse {
  token: string;
  expirationTimeSeconds: number;
  idUsuario: number;
  nombre: string;
  correo: string;
  requiereOnboarding: boolean;
  redirectUrl: string;
}
