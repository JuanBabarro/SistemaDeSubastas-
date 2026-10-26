import { api } from './client';
import type { CrearPujaRequest, PujaResponse, ResultadoPujaResponse } from '../types';

export const pujasApi = {
  pujar: (subastaId: number, data: CrearPujaRequest) =>
    api.post<ResultadoPujaResponse>(`/subastas/${subastaId}/pujas`, data),

  listarPorSubasta: (subastaId: number) =>
    api.get<PujaResponse[]>(`/subastas/${subastaId}/pujas`),

  misPujas: () =>
    api.get<PujaResponse[]>('/pujas/mias'),
};
