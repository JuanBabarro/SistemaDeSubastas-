import { EstadoSubasta } from '../types';

export const ESTADO_LABELS: Record<EstadoSubasta, string> = {
  BORRADOR: 'Borrador',
  PROGRAMADA: 'Programada',
  ACTIVA: 'Activa',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
  DESIERTA: 'Desierta',
};

export const ESTADO_COLORS: Record<EstadoSubasta, string> = {
  BORRADOR: '#94A3B8',
  PROGRAMADA: '#F59E0B',
  ACTIVA: '#10B981',
  FINALIZADA: '#4F46E5',
  CANCELADA: '#EF4444',
  DESIERTA: '#94A3B8',
};

export const CATEGORIAS = [
  'Arte', 'Automotores', 'Coleccionables', 'Electrónica',
  'Hogar', 'Indumentaria', 'Inmuebles', 'Joyería',
  'Libros', 'Muebles', 'Música', 'Tecnología', 'Otro',
];

export const WS_URL = '/ws';
