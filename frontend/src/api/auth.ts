import { api } from './client';
import type { LoginRequest, RegistroRequest, UsuarioResponse } from '../types';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<UsuarioResponse>('/auth/login', data),

  registro: (data: RegistroRequest) =>
    api.post<UsuarioResponse>('/auth/registro', data),

  logout: () => api.post<void>('/auth/logout'),

  me: () => api.get<UsuarioResponse>('/auth/me'),
};
