export interface PreferenciasUsuario {
  idPreferencia: number;
  seleccionesFavoritas: string;
  ciudadesFavoritas: string;
  estadiosFavoritos: string;
  canalesNotificacion: string;
  onboardingCompletado: boolean;
  pasoOnboarding: number;
}

export interface UpdatePreferenciasRequest {
  seleccionesFavoritas?: string;
  ciudadesFavoritas?: string;
  estadiosFavoritos?: string;
  canalesNotificacion?: string;
}

export interface OnboardingRequest {
  paso: number;
  seleccionesFavoritas?: string;
  ciudadesFavoritas?: string;
  estadiosFavoritos?: string;
  canalesNotificacion?: string;
}
