import { api } from './client';
import type { SubastaResponse } from '../types';

export const seguimientosApi = {
  seguir: (subastaId: number, notificaciones = true) =>
    api.post<void>(`/subastas/${subastaId}/seguir?notificaciones=${notificaciones}`),

  dejarDeSeguir: (subastaId: number) =>
    api.delete<void>(`/subastas/${subastaId}/seguir`),

  misSeguimientos: () =>
    api.get<SubastaResponse[]>('/seguimientos'),
};
