export interface PreferenciasUsuario {
  seleccionesFavoritas: number[];
  ciudadesInteres: number[];
  estadiosInteres: number[];
  canalesNotificacion: NotificacionChannel[];
}

export interface NotificacionChannel {
  tipo: 'EMAIL' | 'SMS' | 'PUSH';
  activo: boolean;
}

export interface UpdatePreferenciasRequest {
  seleccionesFavoritas: number[];
  ciudadesInteres: number[];
  estadiosInteres: number[];
  canalesNotificacion: { tipo: string; activo: boolean }[];
}
