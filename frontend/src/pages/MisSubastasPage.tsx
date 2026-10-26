import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subastasApi } from '../api/subastas';
import type { SubastaResponse } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import EstadoBadge from '../components/EstadoBadge';
import { AlertCircle, Eye, Play, XCircle } from 'lucide-react';

export default function MisSubastasPage() {
  const navigate = useNavigate();
  const [subastas, setSubastas] = useState<SubastaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await subastasApi.mias();
      setSubastas(res);
    } catch (e: unknown) {
      setError((e as { mensaje?: string }).mensaje ?? 'Error al cargar tus subastas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePublicar = async (id: number) => {
    try {
      await subastasApi.publicar(id);
      await load();
    } catch (e: unknown) {
      setError((e as { mensaje?: string }).mensaje ?? 'Error al publicar');
    }
  };

  const handleCancelar = async (id: number) => {
    const motivo = prompt('Motivo de la cancelación (opcional):');
    try {
      await subastasApi.cancelar(id, { motivo: motivo || undefined });
      await load();
    } catch (e: unknown) {
      setError((e as { mensaje?: string }).mensaje ?? 'Error al cancelar');
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}><div className="spinner" /></div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
        Mis subastas
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
        Gestioná las subastas que publicaste
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

      {subastas.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 'var(--space-16)',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
            No tenés subastas creadas
          </p>
          <button onClick={() => navigate('/crear-subasta')} style={{
            marginTop: 'var(--space-4)', padding: 'var(--space-3) var(--space-6)',
            background: 'var(--color-primary)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem', fontWeight: 600,
          }}>
            Crear subasta
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {subastas.map(s => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-6)',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', padding: 'var(--space-4)',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{s.nombreProducto}</h3>
                  <EstadoBadge estado={s.estado} />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-6)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  <span>{s.categoriaProducto}</span>
                  <span>Pujas: {s.cantidadPujas}</span>
                  <span>Cierre: {formatDate(s.fechaFin)}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {formatCurrency(s.precioActual)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button onClick={() => navigate(`/subasta/${s.id}`)} title="Ver detalle" style={{
                  padding: 'var(--space-2)', color: 'var(--color-text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <Eye size={18} />
                </button>
                {s.estado === 'BORRADOR' && (
                  <button onClick={() => handlePublicar(s.id)} title="Publicar" style={{
                    padding: 'var(--space-2)', color: 'var(--color-success)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <Play size={18} />
                  </button>
                )}
                {(s.estado === 'BORRADOR' || s.estado === 'PROGRAMADA') && (
                  <button onClick={() => handleCancelar(s.id)} title="Cancelar" style={{
                    padding: 'var(--space-2)', color: 'var(--color-error)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <XCircle size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
