// ─── Enums (espejo del backend) ───────────────────────────────────────────────

export type RolUsuario = 'POSTOR' | 'VENDEDOR' | 'ADMIN';

export type EstadoSubasta =
  | 'BORRADOR'
  | 'PROGRAMADA'
  | 'ACTIVA'
  | 'FINALIZADA'
  | 'CANCELADA'
  | 'DESIERTA';

export type EstadoProducto = 'DISPONIBLE' | 'EN_SUBASTA' | 'VENDIDO';

export type TipoNotificacion =
  | 'NUEVA_PUJA'
  | 'OFERTA_SUPERADA'
  | 'SUBASTA_POR_FINALIZAR'
  | 'SUBASTA_CERRADA'
  | 'SUBASTA_CANCELADA'
  | 'GANADOR_ANUNCIADO'
  | 'ALERTA_INTERES';

export type EstadoPuja = 'ACEPTADA' | 'RECHAZADA';

// ─── Entidades/Respuestas del backend ─────────────────────────────────────────

export interface UsuarioResponse {
  id: number;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  rol: RolUsuario;
  fotoPerfilUrl?: string;
  activo: boolean;
  fechaRegistro: string;
}

export interface FotoProductoResponse {
  id: number;
  url: string;
  nombreArchivo: string;
  tipoContenido: string;
  orden: number;
  esPrincipal: boolean;
  fechaSubida: string;
}

export interface SubastaResponse {
  id: number;
  productoId: number;
  nombreProducto: string;
  descripcionProducto: string;
  categoriaProducto: string;
  marcaProducto?: string;
  modeloProducto?: string;
  fotos: FotoProductoResponse[];
  vendedorId: number;
  vendedorUsername: string;
  precioBase: number;
  precioActual: number;
  incrementoMinimo: number;
  fechaCreacion: string;
  fechaInicio: string;
  fechaFin: string;
  segundosRestantes: number;
  estado: EstadoSubasta;
  cantidadPujas: number;
  ganador?: UsuarioResponse;
}

export interface PujaResponse {
  id: number;
  subastaId: number;
  postorId: number;
  postorUsername: string;
  monto: number;
  fechaHora: string;
  estado: EstadoPuja;
}

export interface ResultadoPujaResponse {
  aceptada: boolean;
  precioActual: number;
  montoSuperado?: number;
  mensaje: string;
  motivoRechazo?: string;
}

export interface ResultadoSubastaResponse {
  subastaId: number;
  estadoFinal: EstadoSubasta;
  ganador?: UsuarioResponse;
  montoGanador?: number;
  fechaCierre?: string;
  desierta: boolean;
  motivoCancelacion?: string;
}

export interface NotificacionResponse {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  fechaCreacion: string;
  leida: boolean;
  fechaLectura?: string;
  subastaId?: number;
}

export interface AlertaInteres {
  id: number;
  categoria?: string;
  marca?: string;
  palabrasClave?: string;
  precioMin?: number;
  precioMax?: number;
  activa: boolean;
  fechaCreacion: string;
}

export interface AlertaInteresRequest {
  categoria: string;
  marca?: string;
  palabrasClave?: string;
  precioMin?: number;
  precioMax?: number;
  activa?: boolean;
}

export interface EstadisticasAdminResponse {
  totalUsuarios: number;
  usuariosActivos: number;
  usuariosConectados: number;
  subastasActivas: number;
  subastasFinalizadas: number;
  subastasCanceladas: number;
  totalPujas: number;
  rankingGanadores: Array<{ usuarioId: number; victorias: number }>;
  productosMasDisputados: Array<{ subastaId: number; cantidadPujas: number }>;
}

// ─── Payloads WebSocket ───────────────────────────────────────────────────────

export interface WsNuevaPuja {
  tipo: 'NUEVA_PUJA';
  subastaId: number;
  precioActual: number;
  postorUsername: string;
  monto: number;
  fechaHora: string;
}

export interface WsEstadoSubasta {
  tipo: 'SUBASTA_CERRADA' | 'SUBASTA_CANCELADA';
  subastaId: number;
  estado?: string;
  ganador?: string;
  monto?: number;
  motivo?: string;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  password: string;
  rol: Exclude<RolUsuario, 'ADMIN'>;
}

export interface CrearSubastaRequest {
  nombreProducto: string;
  descripcionProducto: string;
  categoriaProducto: string;
  marcaProducto?: string;
  modeloProducto?: string;
  precioBase: number;
  incrementoMinimo: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface ActualizarSubastaRequest {
  nombreProducto?: string;
  descripcionProducto?: string;
  categoriaProducto?: string;
  marcaProducto?: string;
  modeloProducto?: string;
  incrementoMinimo?: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface CrearPujaRequest {
  monto: number;
  identificadorSolicitud?: string;
}

export interface CancelarSubastaRequest {
  motivo?: string;
}

// ─── Paginación ───────────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ─── Error de la API ──────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  mensaje: string;
  errores?: Record<string, string>;
  timestamp?: string;
}
