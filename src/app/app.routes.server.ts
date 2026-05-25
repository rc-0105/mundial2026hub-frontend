import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'partidos/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'partidos/:id/en-vivo',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
