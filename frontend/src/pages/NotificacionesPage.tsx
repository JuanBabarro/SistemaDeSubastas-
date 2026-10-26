import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificacionesApi } from '../api/notificaciones';
import type { NotificacionResponse } from '../types';
import { formatDate } from '../utils/format';
import { AlertCircle, Bell } from 'lucide-react';

const TIPO_ICONS: Record<string, string> = {
  NUEVA_PUJA: '🔨',
  OFERTA_SUPERADA: '⬇️',
  SUBASTA_POR_FINALIZAR: '⏰',
  SUBASTA_CERRADA: '🔒',
  SUBASTA_CANCELADA: '❌',
  GANADOR_ANUNCIADO: '🏆',
};

export default function NotificacionesPage() {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState<NotificacionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificacionesApi.todas();
      setNotificaciones(res);
    } catch (e: unknown) {
      setError((e as { mensaje?: string }).mensaje ?? 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMarcarLeida = async (id: number) => {
    try {
      await notificacionesApi.marcarLeida(id);
      setNotificaciones(prev =>
        prev.map(n => n.id === id ? { ...n, leida: true, fechaLectura: new Date().toISOString() } : n)
      );
    } catch {
      // ignore
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}><div className="spinner" /></div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
        Notificaciones
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
        Tus alertas y actualizaciones del sistema
      </p>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          background: 'var(--color-error-bg)', color: 'var(--color-error)',
          padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-6)', fontSize: '0.85rem',
        }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {notificaciones.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 'var(--space-16)',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <Bell size={48} color="var(--color-text-muted)" style={{ margin: '0 auto var(--space-4)' }} />
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>
            No tenés notificaciones
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {notificaciones.map(n => (
            <div
              key={n.id}
              onClick={() => n.subastaId && navigate(`/subasta/${n.subastaId}`)}
              style={{
                display: 'flex', gap: 'var(--space-3)',
                background: n.leida ? 'var(--color-surface)' : 'var(--color-primary-light)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                cursor: n.subastaId ? 'pointer' : 'default',
                transition: 'all var(--transition)',
              }}
              onMouseEnter={e => { if (n.subastaId) e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                {TIPO_ICONS[n.tipo] ?? '🔔'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                    {n.titulo}
                  </h4>
                  {!n.leida && (
                    <button
                      onClick={e => { e.stopPropagation(); handleMarcarLeida(n.id); }}
                      title="Marcar como leída"
                      style={{
                        fontSize: '0.75rem', color: 'var(--color-primary)',
                        padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-primary)',
                      }}
                    >
                      Marcar leída
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>
                  {n.mensaje}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {formatDate(n.fechaCreacion)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
