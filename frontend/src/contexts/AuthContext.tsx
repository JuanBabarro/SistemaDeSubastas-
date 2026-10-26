import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { UsuarioResponse, ApiError, RegistroRequest } from '../types';

interface AuthContextValue {
  user: UsuarioResponse | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (data: RegistroRequest) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsuarioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuario al montar
  useEffect(() => {
    authApi.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    setError(null);
    try {
      const u = await authApi.login({ usernameOrEmail, password });
      setUser(u);
    } catch (e: unknown) {
      const err = e as ApiError;
      setError(err.mensaje ?? 'Error al iniciar sesión');
      throw err;
    }
  }, []);

  const register = useCallback(async (data: RegistroRequest) => {
    setError(null);
    try {
      const u = await authApi.registro(data);
      setUser(u);
    } catch (e: unknown) {
      const err = e as ApiError;
      setError(err.mensaje ?? 'Error al registrar');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const hasRole = useCallback((role: string) => {
    return user?.rol === role;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, error, clearError, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
