import type { SubastaResponse, EstadoSubasta } from '../types';
import { ESTADO_LABELS, ESTADO_COLORS } from '../utils/constants';
import { formatCurrency, formatCountdown } from '../utils/format';
import { Link } from 'react-router-dom';
import { Clock, Tag, User } from 'lucide-react';

export default function SubastaCard({ subasta }: { subasta: SubastaResponse }) {
  const estadoLabel = ESTADO_LABELS[subasta.estado];
  const estadoColor = ESTADO_COLORS[subasta.estado];
  const foto = subasta.fotos?.find(f => f.esPrincipal) ?? subasta.fotos?.[0];

  return (
    <Link to={`/subasta/${subasta.id}`} style={{
      display: 'block',
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      overflow: 'hidden',
      transition: 'all var(--transition)',
      textDecoration: 'none',
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
      {/* Image */}
      <div style={{
        height: 200,
        background: foto ? `url(${foto.url}) center/cover no-repeat` : 'var(--color-bg)',
        position: 'relative',
      }}>
        {/* Estado badge */}
        <span style={{
          position: 'absolute', top: 'var(--space-3)', left: 'var(--space-3)',
          background: estadoColor, color: '#fff',
          padding: '4px 10px', borderRadius: '20px',
          fontSize: '0.75rem', fontWeight: 600,
        }}>
          {estadoLabel}
        </span>
        {/* Countdown */}
        {subasta.estado === 'ACTIVA' && (
          <span style={{
            position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)',
            background: 'rgba(0,0,0,0.6)', color: '#fff',
            padding: '4px 10px', borderRadius: '20px',
            fontSize: '0.75rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Clock size={12} />
            {formatCountdown(subasta.segundosRestantes)}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--space-4)' }}>
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
      </div>
    </Link>
  );
}
