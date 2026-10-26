import { api } from './client';
import type {
  SubastaResponse,
  Page,
  EstadoSubasta,
  CrearSubastaRequest,
  ActualizarSubastaRequest,
  CancelarSubastaRequest,
  ResultadoSubastaResponse,
  FotoProductoResponse,
} from '../types';

export const subastasApi = {
  listar: (params?: {
    estado?: EstadoSubasta;
    categoria?: string;
    precioMin?: number;
    precioMax?: number;
    page?: number;
    size?: number;
    sort?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.estado)    q.set('estado', params.estado);
    if (params?.categoria) q.set('categoria', params.categoria);
    if (params?.precioMin != null) q.set('precioMin', String(params.precioMin));
    if (params?.precioMax != null) q.set('precioMax', String(params.precioMax));
    if (params?.page != null) q.set('page', String(params.page));
    if (params?.size != null) q.set('size', String(params.size));
    if (params?.sort) q.set('sort', params.sort);
    return api.get<Page<SubastaResponse>>(`/subastas?${q.toString()}`);
  },

  obtener: (id: number) =>
    api.get<SubastaResponse>(`/subastas/${id}`),

  mias: () =>
    api.get<SubastaResponse[]>('/subastas/mias'),

  crear: (data: CrearSubastaRequest) =>
    api.post<SubastaResponse>('/subastas', data),

  actualizar: (id: number, data: ActualizarSubastaRequest) =>
    api.put<SubastaResponse>(`/subastas/${id}`, data),

  publicar: (id: number) =>
    api.post<SubastaResponse>(`/subastas/${id}/publicacion`),

  cancelar: (id: number, data?: CancelarSubastaRequest) =>
    api.post<void>(`/subastas/${id}/cancelacion`, data ?? {}),

  resultado: (id: number) =>
    api.get<ResultadoSubastaResponse>(`/subastas/${id}/resultado`),

  subirFoto: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('archivo', file);
    return api.upload<FotoProductoResponse>(`/subastas/${id}/fotos`, formData);
  },

  eliminarFoto: (id: number, fotoId: number) =>
    api.delete<void>(`/subastas/${id}/fotos/${fotoId}`),

  ordenarFotos: (id: number, fotosIds: number[]) =>
    api.put<void>(`/subastas/${id}/fotos/orden`, { fotosIds }),
};
