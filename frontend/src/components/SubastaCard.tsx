import { useState } from 'react';
import type { SubastaResponse } from '../types';
import { ESTADO_LABELS, ESTADO_COLORS } from '../utils/constants';
import { formatCurrency, formatCountdown } from '../utils/format';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Tag, User } from 'lucide-react';
import { mediaUrl } from '../utils/media';

export default function SubastaCard({ subasta }: { subasta: SubastaResponse }) {
  const [indiceFoto, setIndiceFoto] = useState(() => {
    const principal = subasta.fotos?.findIndex(foto => foto.esPrincipal) ?? -1;
    return principal >= 0 ? principal : 0;
  });
  const estadoLabel = ESTADO_LABELS[subasta.estado];
  const estadoColor = ESTADO_COLORS[subasta.estado];
  const fotos = [...(subasta.fotos ?? [])].sort((a, b) => a.orden - b.orden);
  const indiceActual = Math.min(indiceFoto, Math.max(fotos.length - 1, 0));
  const foto = fotos[indiceActual];
  const navegarFoto = (direccion: -1 | 1) => {
    setIndiceFoto(actual => (actual + direccion + fotos.length) % fotos.length);
  };

  return (
    <article style={{
      display: 'block',
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      overflow: 'hidden',
      transition: 'all var(--transition)',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      (e.currentTarget as HTMLElement).style.transform = 'none';
    }}
    >
      {/* Imagen clickeable con controles de galería independientes */}
      <div style={{
        height: 270,
        position: 'relative',
        background: 'var(--color-bg)',
        overflow: 'hidden',
      }}>
        <Link
          to={`/subasta/${subasta.id}`}
          aria-label={`Ver subasta ${subasta.nombreProducto}`}
          style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'block' }}
        >
          {foto && <img src={mediaUrl(foto.url)} alt={subasta.nombreProducto} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />}
        </Link>
        {/* Estado badge */}
        <span style={{
          position: 'absolute', zIndex: 2, top: 'var(--space-3)', left: 'var(--space-3)',
          background: estadoColor, color: '#fff',
          padding: '4px 10px', borderRadius: '20px',
          fontSize: '0.75rem', fontWeight: 600,
        }}>
          {estadoLabel}
        </span>
        {/* Countdown */}
        {subasta.estado === 'ACTIVA' && (
          <span style={{
            position: 'absolute', zIndex: 2, top: 'var(--space-3)', right: 'var(--space-3)',
            background: 'rgba(0,0,0,0.6)', color: '#fff',
            padding: '4px 10px', borderRadius: '20px',
            fontSize: '0.75rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Clock size={12} />
            {formatCountdown(subasta.segundosRestantes)}
          </span>
        )}
        {fotos.length > 1 && (
          <>
            <button type="button" aria-label="Ver foto anterior" onClick={() => navegarFoto(-1)} style={{ position: 'absolute', zIndex: 2, left: 8, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, display: 'grid', placeItems: 'center', border: 0, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', color: '#1f2937', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', cursor: 'pointer' }}>
              <ChevronLeft size={20} />
            </button>
            <button type="button" aria-label="Ver foto siguiente" onClick={() => navegarFoto(1)} style={{ position: 'absolute', zIndex: 2, right: 8, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, display: 'grid', placeItems: 'center', border: 0, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', color: '#1f2937', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', cursor: 'pointer' }}>
              <ChevronRight size={20} />
            </button>
            <span aria-live="polite" style={{ position: 'absolute', zIndex: 2, bottom: 8, left: '50%', transform: 'translateX(-50%)', padding: '3px 9px', borderRadius: 12, background: 'rgba(0,0,0,0.58)', color: '#fff', fontSize: '0.72rem' }}>
              {indiceActual + 1} / {fotos.length}
            </span>
          </>
        )}
      </div>

      {/* Content */}
      <Link to={`/subasta/${subasta.id}`} style={{ display: 'block', padding: 'var(--space-4)', textDecoration: 'none' }}>
        <h3 style={{
          fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-1)',
          color: 'var(--color-text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {subasta.nombreProducto}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginBottom: 'var(--space-2)' }}>
          <Tag size={14} color="var(--color-text-muted)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {subasta.categoriaProducto}
          </span>
          <span style={{ margin: '0 var(--space-1)', color: 'var(--color-text-muted)' }}>·</span>
          <User size={14} color="var(--color-text-muted)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            @{subasta.vendedorUsername}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Precio actual</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {formatCurrency(subasta.precioActual)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Pujas</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {subasta.cantidadPujas}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
