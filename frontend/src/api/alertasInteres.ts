import { api } from './client';
import type { AlertaInteres, AlertaInteresRequest } from '../types';

export const alertasInteresApi = {
  listar: () => api.get<AlertaInteres[]>('/alertas-interes'),
  crear: (data: AlertaInteresRequest) => api.post<AlertaInteres>('/alertas-interes', data),
  actualizar: (id: number, data: AlertaInteresRequest) =>
    api.put<AlertaInteres>(`/alertas-interes/${id}`, data),
  eliminar: (id: number) => api.delete<void>(`/alertas-interes/${id}`),
};
