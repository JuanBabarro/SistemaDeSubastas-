import type { EstadoSubasta } from '../types';
import { ESTADO_LABELS, ESTADO_COLORS } from '../utils/constants';

export default function EstadoBadge({ estado }: { estado: EstadoSubasta }) {
  const label = ESTADO_LABELS[estado];
  const color = ESTADO_COLORS[estado];

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: color + '18', color,
      padding: '4px 12px', borderRadius: '20px',
      fontSize: '0.8rem', fontWeight: 600,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: color,
        animation: estado === 'ACTIVA' ? 'pulse-dot 2s infinite' : 'none',
      }} />
      {label}
    </span>
  );
}
