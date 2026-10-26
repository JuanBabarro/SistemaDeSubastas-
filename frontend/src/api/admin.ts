import { api } from './client';
import type {
  EstadisticasAdminResponse,
  UsuarioResponse,
  SubastaResponse,
  CancelarSubastaRequest,
} from '../types';

export const adminApi = {
  estadisticas: () =>
    api.get<EstadisticasAdminResponse>('/admin/estadisticas'),

  estado: () =>
    api.get<SubastaResponse[]>('/admin/estado'),

  usuarios: () =>
    api.get<UsuarioResponse[]>('/admin/usuarios'),

  cambiarEstadoCuenta: (id: number, activo: boolean) =>
    api.patch<void>(`/admin/usuarios/${id}/estado?activo=${activo}`),

  cancelarSubasta: (id: number, data: CancelarSubastaRequest) =>
    api.post<void>(`/admin/subastas/${id}/cancelacion`, data),
};
