import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subastasApi } from '../api/subastas';
import type { SubastaResponse } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import EstadoBadge from '../components/EstadoBadge';
import { AlertCircle, Eye, Trash2, XCircle } from 'lucide-react';

type FiltroSubastas = 'TODAS' | 'ACTIVAS' | 'PENDIENTES' | 'CANCELADAS' | 'FINALIZADAS';

const FILTROS: { valor: FiltroSubastas; etiqueta: string }[] = [
  { valor: 'TODAS', etiqueta: 'Todas' },
  { valor: 'ACTIVAS', etiqueta: 'Activas' },
  { valor: 'PENDIENTES', etiqueta: 'Pendientes' },
  { valor: 'CANCELADAS', etiqueta: 'Canceladas' },
  { valor: 'FINALIZADAS', etiqueta: 'Finalizadas' },
];

export default function MisSubastasPage() {
  const navigate = useNavigate();
  const [subastas, setSubastas] = useState<SubastaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroSubastas>('TODAS');

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

  const handleCancelar = async (id: number) => {
    const subasta = subastas.find(item => item.id === id);
    if (!subasta) return;
    const estadoTexto = subasta.estado === 'ACTIVA' ? 'activa' : 'pendiente';
    const confirmado = window.confirm(
      `La subasta “${subasta.nombreProducto}” está ${estadoTexto}. Si confirmás, se cancelará y dejará de aceptar pujas. ¿Querés continuar?`
    );
    if (!confirmado) return;
    const motivo = window.prompt('Motivo de cancelación (opcional):');
    if (motivo === null) return;
    try {
      await subastasApi.cancelar(id, { motivo: motivo || undefined });
      await load();
    } catch (e: unknown) {
      setError((e as { mensaje?: string }).mensaje ?? 'Error al cancelar');
    }
  };

  const handleEliminar = async (id: number) => {
    const subasta = subastas.find(item => item.id === id);
    if (!subasta || !window.confirm(`¿Quitar “${subasta.nombreProducto}” del historial de Mis subastas?`)) return;
    try {
      await subastasApi.eliminarDelHistorial(id);
      await load();
    } catch (e: unknown) {
      setError((e as { mensaje?: string }).mensaje ?? 'No se pudo quitar del historial');
    }
  };

  const visibles = subastas.filter(subasta => {
    if (filtro === 'ACTIVAS') return subasta.estado === 'ACTIVA';
    if (filtro === 'PENDIENTES') return subasta.estado === 'PROGRAMADA';
    if (filtro === 'CANCELADAS') return subasta.estado === 'CANCELADA';
    if (filtro === 'FINALIZADAS') return subasta.estado === 'FINALIZADA' || subasta.estado === 'DESIERTA';
    return true;
  });

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

      <div role="tablist" aria-label="Filtrar mis subastas" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        {FILTROS.map(opcion => (
          <button key={opcion.valor} type="button" role="tab" aria-selected={filtro === opcion.valor} onClick={() => setFiltro(opcion.valor)} style={{ padding: 'var(--space-2) var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: filtro === opcion.valor ? 'var(--color-primary)' : 'var(--color-surface)', color: filtro === opcion.valor ? '#fff' : 'var(--color-text-secondary)', fontWeight: 600 }}>
            {opcion.etiqueta}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 'var(--space-16)',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
            {subastas.length === 0 ? 'No tenés subastas en el historial' : 'No hay subastas en esta categoría'}
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
          {visibles.map(s => (
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
                {(s.estado === 'ACTIVA' || s.estado === 'PROGRAMADA') && (
                  <button onClick={() => void handleCancelar(s.id)} title="Cancelar subasta" aria-label={`Cancelar ${s.nombreProducto}`} style={{
                    padding: 'var(--space-2)', color: 'var(--color-error)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <XCircle size={18} />
                  </button>
                )}
                {(s.estado === 'CANCELADA' || s.estado === 'FINALIZADA' || s.estado === 'DESIERTA') && (
                  <button onClick={() => void handleEliminar(s.id)} title="Quitar del historial" aria-label={`Quitar ${s.nombreProducto} del historial`} style={{ padding: 'var(--space-2)', color: 'var(--color-error)', borderRadius: 'var(--radius-sm)' }}>
                    <Trash2 size={18} />
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
