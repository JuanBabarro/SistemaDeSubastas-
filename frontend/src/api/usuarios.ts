import { api } from './client';
import type { UsuarioResponse, SubastaResponse } from '../types';

export const usuariosApi = {
  me: () => api.get<UsuarioResponse>('/usuarios/me'),

  actualizarPerfil: (data: { nombre?: string; apellido?: string; email?: string }) =>
    api.put<UsuarioResponse>('/usuarios/me', data),

  historial: () =>
    api.get<SubastaResponse[]>('/usuarios/me/historial'),

  ganadas: () =>
    api.get<SubastaResponse[]>('/usuarios/me/ganadas'),

  seguimientos: () =>
    api.get<SubastaResponse[]>('/usuarios/me/seguimientos'),
};
