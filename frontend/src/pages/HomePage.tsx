import { useState, useEffect } from 'react';
import { subastasApi } from '../api/subastas';
import SubastaCard from '../components/SubastaCard';
import type { Page, SubastaResponse, EstadoSubasta } from '../types';
import { CATEGORIAS } from '../utils/constants';
import { Search, Filter, X } from 'lucide-react';

const ESTADOS: { value: EstadoSubasta | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'ACTIVA', label: 'Activas' },
  { value: 'PROGRAMADA', label: 'Programadas' },
  { value: 'FINALIZADA', label: 'Finalizadas' },
];

export default function HomePage() {
  const [page, setPage] = useState<Page<SubastaResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [estado, setEstado] = useState<EstadoSubasta | ''>('');
  const [categoria, setCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const load = async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await subastasApi.listar({
        estado: estado || undefined,
        categoria: categoria || undefined,
        q: busqueda.trim() || undefined,
        precioMin: precioMin ? Number(precioMin) : undefined,
        precioMax: precioMax ? Number(precioMax) : undefined,
        page: pageNum,
        size: 12,
        sort: 'fechaFin,desc',
      });
      setPage(res);
    } catch (e: unknown) {
      setError((e as { mensaje?: string }).mensaje ?? 'Error al cargar subastas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(0); }, 250);
    return () => window.clearTimeout(timer);
  }, [estado, categoria, busqueda, precioMin, precioMax]);

  const handleSearch = () => load(0);
  const hasFilters = estado || categoria || busqueda || precioMin || precioMax;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          Subastas disponibles
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
          Explorá las subastas activas y participá en tiempo real
        </p>
      </div>

      {/* Search bar */}
      <div style={{
        display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por título, modelo o categoría..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{
              width: '100%', padding: 'var(--space-3) var(--space-4) var(--space-3) 40px',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem', outline: 'none',
            }}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-4)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem', color: hasFilters ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            background: hasFilters ? 'var(--color-primary-light)' : 'transparent',
          }}
        >
          <Filter size={18} />
          Filtros
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)', padding: 'var(--space-6)',
          marginBottom: 'var(--space-6)',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)',
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>Estado</label>
            <select
              value={estado}
              onChange={e => setEstado(e.target.value as EstadoSubasta | '')}
              style={{
                width: '100%', padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem', outline: 'none',
              }}
            >
              {ESTADOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>Categoría</label>
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              style={{
                width: '100%', padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem', outline: 'none',
              }}
            >
              <option value="">Todas</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>Precio mínimo</label>
            <input type="number" value={precioMin} onChange={e => setPrecioMin(e.target.value)}
              style={{
                width: '100%', padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem', outline: 'none',
              }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>Precio máximo</label>
            <input type="number" value={precioMax} onChange={e => setPrecioMax(e.target.value)}
              style={{
                width: '100%', padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem', outline: 'none',
              }} />
          </div>
          {hasFilters && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={() => { setEstado(''); setCategoria(''); setBusqueda(''); setPrecioMin(''); setPrecioMax(''); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                  padding: 'var(--space-2) var(--space-3)',
                  color: 'var(--color-error)', fontSize: '0.85rem',
                }}>
                <X size={14} /> Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: 'var(--color-error-bg)', color: 'var(--color-error)',
          padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-6)', fontSize: '0.9rem',
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
          <div className="spinner" />
        </div>
      )}

      {/* Grid */}
      {!loading && page && (
        <>
          {page.content.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: 'var(--space-2)' }}>No se encontraron subastas</p>
              <p style={{ fontSize: '0.9rem' }}>Probá con otro título, modelo o categoría, o cambiá los filtros.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 'var(--space-6)',
            }}>
              {page.content.map(s => <SubastaCard key={s.id} subasta={s} />)}
            </div>
          )}

          {/* Pagination */}
          {page.totalPages > 1 && (
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 'var(--space-2)',
              marginTop: 'var(--space-8)',
            }}>
              <button
                disabled={page.first}
                onClick={() => load(page.number - 1)}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  opacity: page.first ? 0.5 : 1,
                }}
              >
                Anterior
              </button>
              <span style={{
                padding: 'var(--space-2) var(--space-3)',
                fontSize: '0.85rem', color: 'var(--color-text-muted)',
                display: 'flex', alignItems: 'center',
              }}>
                Página {page.number + 1} de {page.totalPages}
              </span>
              <button
                disabled={page.last}
                onClick={() => load(page.number + 1)}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  opacity: page.last ? 0.5 : 1,
                }}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
