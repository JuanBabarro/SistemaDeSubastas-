import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pujasApi } from '../api/pujas';
import type { PujaResponse } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { AlertCircle } from 'lucide-react';

export default function MisPujasPage() {
  const navigate = useNavigate();
  const [pujas, setPujas] = useState<PujaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    pujasApi.misPujas()
      .then(setPujas)
      .catch((e: unknown) => setError((e as { mensaje?: string }).mensaje ?? 'Error al cargar tus pujas'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}><div className="spinner" /></div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
        Mis pujas
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
        Historial de tus pujas realizadas
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

      {pujas.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 'var(--space-16)',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>
            Aún no hiciste ninguna puja
          </p>
        </div>
      ) : (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)', overflow: 'hidden',
        }}>
          {pujas.map((puja, i) => (
            <div key={puja.id} onClick={() => navigate(`/subasta/${puja.subastaId}`)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 'var(--space-4)',
              borderBottom: i < pujas.length - 1 ? '1px solid var(--color-border)' : 'none',
              cursor: 'pointer',
              transition: 'background var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Subasta #{puja.subastaId}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formatDate(puja.fechaHora)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {formatCurrency(puja.monto)}
                </div>
                <div style={{ fontSize: '0.75rem', color: puja.estado === 'ACEPTADA' ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {puja.estado === 'ACEPTADA' ? 'Aceptada' : 'Rechazada'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
