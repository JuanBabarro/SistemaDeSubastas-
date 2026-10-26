import type { ApiError } from '../types';

// El proxy de Vite redirige /api → http://localhost:8080/api
// En producción, cambiar VITE_API_URL en el .env
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      credentials: 'include', // Necesario para sesiones HTTP (JSESSIONID)
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (res.status === 204 || res.headers.get('content-length') === '0') {
      return undefined as T;
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const err: ApiError = data ?? { status: res.status, mensaje: 'Error del servidor' };
      throw err;
    }

    return data as T;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  // Subida de archivos (multipart) — sin Content-Type manual (el browser lo pone)
  async upload<T>(path: string, formData: FormData): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const err: ApiError = data ?? { status: res.status, mensaje: 'Error al subir archivo' };
      throw err;
    }

    return data as T;
  }
}

export const api = new ApiClient(BASE);
