import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import type { EstadisticasAdminResponse, UsuarioResponse, SubastaResponse } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import EstadoBadge from '../components/EstadoBadge';
import { AlertCircle, Users, Gavel, TrendingUp, Package } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<EstadisticasAdminResponse | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [subastas, setSubastas] = useState<SubastaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      adminApi.estadisticas(),
      adminApi.usuarios(),
      adminApi.estado(),
    ])
      .then(([s, u, sb]) => {
        setStats(s);
        setUsuarios(u);
        setSubastas(sb);
      })
      .catch((e: unknown) => setError((e as { mensaje?: string }).mensaje ?? 'Error al cargar datos'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleUsuario = async (id: number, activo: boolean) => {
    try {
      await adminApi.cambiarEstadoCuenta(id, !activo);
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: !activo } : u));
    } catch (e: unknown) {
      setError((e as { mensaje?: string }).mensaje ?? 'Error al cambiar estado');
    }
  };

  const handleCancelarSubasta = async (id: number) => {
    const motivo = prompt('Motivo de la cancelación:');
    if (motivo === null) return;
    try {
      await adminApi.cancelarSubasta(id, { motivo });
      setSubastas(prev => prev.filter(s => s.id !== id));
    } catch (e: unknown) {
      setError((e as { mensaje?: string }).mensaje ?? 'Error al cancelar');
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}><div className="spinner" /></div>;
  }

  const statCards = [
    { label: 'Usuarios totales', value: stats?.totalUsuarios ?? 0, icon: <Users size={24} />, color: 'var(--color-primary)' },
    { label: 'Subastas activas', value: stats?.subastasActivas ?? 0, icon: <Gavel size={24} />, color: 'var(--color-success)' },
    { label: 'Subastas finalizadas', value: stats?.subastasFinalizadas ?? 0, icon: <TrendingUp size={24} />, color: 'var(--color-info)' },
    { label: 'Total pujas', value: stats?.totalPujas ?? 0, icon: <Package size={24} />, color: 'var(--color-warning)' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
        Panel de administración
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
        Estadísticas y gestión del sistema
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

      {/* Stats cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4)', marginBottom: 'var(--space-8)',
      }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', padding: 'var(--space-6)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <span style={{ color: card.color }}>{card.icon}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Subastas activas */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Subastas activas
        </h2>
        {subastas.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No hay subastas activas</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {subastas.map(s => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)', padding: 'var(--space-4)',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{s.nombreProducto}</span>
                    <EstadoBadge estado={s.estado} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    @{s.vendedorUsername} · {s.cantidadPujas} pujas · Cierra: {formatDate(s.fechaFin)}
                  </div>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {formatCurrency(s.precioActual)}
                </div>
                <button onClick={() => handleCancelarSubasta(s.id)} style={{
                  padding: 'var(--space-2) var(--space-3)',
                  color: 'var(--color-error)', border: '1px solid var(--color-error)',
                  borderRadius: 'var(--radius-sm)', fontSize: '0.8rem',
                }}>
                  Cancelar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usuarios */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Usuarios ({usuarios.length})
        </h2>
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Usuario', 'Email', 'Rol', 'Estado', 'Registro', 'Acción'].map(h => (
                  <th key={h} style={{
                    padding: 'var(--space-3) var(--space-4)',
                    textAlign: 'left', fontSize: '0.8rem', fontWeight: 600,
                    color: 'var(--color-text-muted)', textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{u.nombre} {u.apellido}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>@{u.username}</div>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    {u.email}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <span style={{
                      fontSize: '0.8rem', fontWeight: 600,
                      padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                      background: u.rol === 'ADMIN' ? 'var(--color-error-bg)' : u.rol === 'VENDEDOR' ? 'var(--color-info-bg)' : 'var(--color-success-bg)',
                      color: u.rol === 'ADMIN' ? 'var(--color-error)' : u.rol === 'VENDEDOR' ? 'var(--color-info)' : 'var(--color-success)',
                    }}>
                      {u.rol}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <span style={{
                      fontSize: '0.8rem', fontWeight: 500,
                      color: u.activo ? 'var(--color-success)' : 'var(--color-error)',
                    }}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {formatDate(u.fechaRegistro)}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <button onClick={() => handleToggleUsuario(u.id, u.activo)} style={{
                      fontSize: '0.8rem', padding: 'var(--space-1) var(--space-2)',
                      border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                      color: u.activo ? 'var(--color-error)' : 'var(--color-success)',
                    }}>
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
