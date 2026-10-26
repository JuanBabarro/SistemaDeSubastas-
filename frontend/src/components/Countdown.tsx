import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function Countdown({ seconds, style }: { seconds: number; style?: React.CSSProperties }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(() => {
      setRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining]);

  const text = remaining <= 0 ? 'Finalizada' : formatTime(remaining);

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, ...style }}>
      <Clock size={16} />
      {text}
    </span>
  );
}

function formatTime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
