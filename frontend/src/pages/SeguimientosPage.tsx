import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { seguimientosApi } from '../api/seguimientos';
import type { SubastaResponse } from '../types';
import SubastaCard from '../components/SubastaCard';
import { AlertCircle } from 'lucide-react';

export default function SeguimientosPage() {
  const navigate = useNavigate();
  const [subastas, setSubastas] = useState<SubastaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    seguimientosApi.misSeguimientos()
      .then(setSubastas)
      .catch((e: unknown) => setError((e as { mensaje?: string }).mensaje ?? 'Error al cargar seguimientos'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}><div className="spinner" /></div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
        Mis seguimientos
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
        Subastas que estás siguiendo
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
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>
            No estás siguiendo ninguna subasta
          </p>
          <button onClick={() => navigate('/')} style={{
            marginTop: 'var(--space-4)', padding: 'var(--space-3) var(--space-6)',
            background: 'var(--color-primary)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem', fontWeight: 600,
          }}>
            Explorar subastas
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--space-6)',
        }}>
          {subastas.map(s => <SubastaCard key={s.id} subasta={s} />)}
        </div>
      )}
    </div>
  );
}
