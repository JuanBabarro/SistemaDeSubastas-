import { api } from './client';
import type { NotificacionResponse } from '../types';

export const notificacionesApi = {
  todas: () =>
    api.get<NotificacionResponse[]>('/notificaciones'),

  noLeidas: () =>
    api.get<NotificacionResponse[]>('/notificaciones/no-leidas'),

  marcarLeida: (id: number) =>
    api.patch<void>(`/notificaciones/${id}/leida`),
};
