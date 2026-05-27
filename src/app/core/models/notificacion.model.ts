export interface Notificacion {
  idNotificacion: number;
  canal: 'PUSH' | 'EMAIL';
  contenido: string;
  estadoEntrega: 'PENDIENTE' | 'ENVIADA' | 'FALLIDA';
  timestamp: string;
  idPartido?: number;
}
