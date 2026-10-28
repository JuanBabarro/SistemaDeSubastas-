import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subastasApi } from '../api/subastas';
import { CATEGORIAS } from '../utils/constants';
import { fromDatetimeLocal } from '../utils/format';
import { AlertCircle, CheckCircle } from 'lucide-react';

function toLocalDatetimeInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function initialAuctionDates() {
  const now = new Date();
  return {
    inicio: toLocalDatetimeInput(new Date(now.getTime() + 2 * 60_000)),
    fin: toLocalDatetimeInput(new Date(now.getTime() + 60 * 60_000)),
  };
}

export default function CrearSubastaPage() {
  const navigate = useNavigate();
  const fechasIniciales = initialAuctionDates();
  const [form, setForm] = useState({
    nombreProducto: '',
    descripcionProducto: '',
    categoriaProducto: '',
    marcaProducto: '',
    modeloProducto: '',
    precioBase: '',
    incrementoMinimo: '',
    fechaInicio: fechasIniciales.inicio,
    fechaFin: fechasIniciales.fin,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fotos, setFotos] = useState<File[]>([]);
  const [modoInicio, setModoInicio] = useState<'ahora' | 'programar'>('ahora');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (fotos.length === 0) {
      setError('Agregá al menos una foto del producto antes de crear la subasta.');
      document.getElementById('fotos-subasta')?.focus();
      return;
    }
    // Al publicar ahora, la subasta queda visible como PROGRAMADA y se activa
    // automáticamente dos minutos después de enviar el formulario.
    const inicio = modoInicio === 'ahora'
      ? new Date(Date.now() + 2 * 60_000)
      : new Date(form.fechaInicio);
    const fin = new Date(form.fechaFin);
    if (Number.isNaN(inicio.getTime()) || (modoInicio === 'programar' && inicio.getTime() <= Date.now() + 60_000)) {
      setError('La fecha de inicio programada debe ser al menos un minuto posterior a ahora.');
      return;
    }
    if (Number.isNaN(fin.getTime()) || fin.getTime() - inicio.getTime() < 60_000) {
      setError('La fecha de fin debe ser al menos un minuto posterior a la fecha de inicio.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    let subastaCreadaId: number | null = null;
    try {
      const subasta = await subastasApi.crear({
        nombreProducto: form.nombreProducto,
        descripcionProducto: form.descripcionProducto,
        categoriaProducto: form.categoriaProducto,
        marcaProducto: form.marcaProducto || undefined,
        modeloProducto: form.modeloProducto || undefined,
        precioBase: Number(form.precioBase),
        incrementoMinimo: Number(form.incrementoMinimo),
        fechaInicio: fromDatetimeLocal(toLocalDatetimeInput(inicio)),
        fechaFin: fromDatetimeLocal(form.fechaFin),
      });
      subastaCreadaId = subasta.id;
      for (const foto of fotos) {
        await subastasApi.subirFoto(subasta.id, foto);
      }
      await subastasApi.publicar(subasta.id);
      setSuccess(true);
      setTimeout(() => navigate(`/subasta/${subasta.id}`), 1200);
    } catch (err: unknown) {
      const errorApi = err as { mensaje?: string; errores?: Record<string, string> };
      const nombresCampos: Record<string, string> = {
        nombreProducto: 'Nombre del producto',
        descripcionProducto: 'Descripción',
        categoriaProducto: 'Categoría',
        precioBase: 'Precio base',
        incrementoMinimo: 'Incremento mínimo',
        fechaInicio: 'Fecha de inicio',
        fechaFin: 'Fecha de fin',
      };
      const detalles = errorApi.errores
        ? Object.entries(errorApi.errores).map(([campo, detalle]) => `${nombresCampos[campo] ?? campo}: ${detalle}`).join(' · ')
        : '';
      const mensaje = detalles || errorApi.mensaje || 'Error al crear la subasta';
      if (subastaCreadaId != null) {
        try {
          await subastasApi.descartarBorrador(subastaCreadaId);
          setError(`${mensaje}. Se descartó la creación incompleta; corregí los datos e intentá nuevamente.`);
        } catch {
          setError(`${mensaje}. No se pudo limpiar automáticamente el registro incompleto; no aparecerá en “Mis subastas”. Contactá con soporte si persiste.`);
        }
      } else {
        setError(mensaje);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: 'var(--space-3) var(--space-4)',
    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
    fontSize: '0.9rem', outline: 'none',
    transition: 'border-color var(--transition)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 'var(--space-2)',
    color: 'var(--color-text-secondary)',
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
        Crear nueva subasta
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
        Completá los datos del producto y configurá los parámetros de la subasta
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

      {success && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          background: 'var(--color-success-bg)', color: 'var(--color-success)',
          padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-6)', fontSize: '0.85rem',
        }}>
          <CheckCircle size={16} /> {modoInicio === 'ahora' ? 'Subasta publicada. Se activará en 2 minutos.' : 'Subasta programada correctamente.'} Redirigiendo...
        </div>
      )}

      <form onSubmit={handleSubmit} style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)',
      }}>
        {/* Producto */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
          Datos del producto
        </h2>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label style={labelStyle}>Nombre del producto *</label>
          <input type="text" value={form.nombreProducto} onChange={set('nombreProducto')} required maxLength={200} style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
        </div>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label style={labelStyle}>Descripción *</label>
          <textarea value={form.descripcionProducto} onChange={set('descripcionProducto')} required maxLength={5000} rows={4} style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div>
            <label style={labelStyle}>Categoría *</label>
            <select value={form.categoriaProducto} onChange={set('categoriaProducto')} required style={inputStyle}>
              <option value="">Seleccionar...</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Marca</label>
            <input type="text" value={form.marcaProducto} onChange={set('marcaProducto')} maxLength={100} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-8)' }}>
          <label style={labelStyle}>Modelo</label>
          <input type="text" value={form.modeloProducto} onChange={set('modeloProducto')} maxLength={100} style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
        </div>

        <div style={{ marginBottom: 'var(--space-8)' }}>
          <label htmlFor="fotos-subasta" style={labelStyle}>Fotos del producto * (al menos 1, hasta 10; JPEG/PNG/WebP, máximo 5 MB cada una)</label>
          <input
            id="fotos-subasta"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            required
            onInvalid={e => {
              e.preventDefault();
              setError('Agregá al menos una foto del producto antes de crear la subasta.');
            }}
            onChange={e => {
              const seleccionadas = Array.from(e.target.files ?? []);
              if (seleccionadas.length > 10) {
                setError('Podés agregar hasta 10 fotos por subasta.');
                e.target.value = '';
                setFotos([]);
                return;
              }
              const invalida = seleccionadas.find(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024);
              if (invalida) {
                setError('Cada foto debe ser JPEG, PNG o WebP y pesar como máximo 5 MB.');
                e.target.value = '';
                setFotos([]);
                return;
              }
              setError(null);
              setFotos(seleccionadas);
            }}
            style={inputStyle}
          />
          {fotos.length > 0 && (
            <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              {fotos.length} foto(s): {fotos.map(foto => foto.name).join(', ')}
            </p>
          )}
        </div>

        {/* Subasta */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
          Parámetros de la subasta
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div>
            <label style={labelStyle}>Precio base *</label>
            <input type="number" step="0.01" min="0.01" value={form.precioBase} onChange={set('precioBase')} required style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
          </div>
          <div>
            <label style={labelStyle}>Incremento mínimo *</label>
            <input type="number" step="0.01" min="0.01" value={form.incrementoMinimo} onChange={set('incrementoMinimo')} required style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label style={labelStyle}>Inicio de la subasta *</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 'var(--space-3)' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
              <input type="radio" name="modoInicio" checked={modoInicio === 'ahora'} onChange={() => setModoInicio('ahora')} />
              <span><strong>Publicar ahora</strong><br /><small>Se activa automáticamente en 2 minutos.</small></span>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
              <input type="radio" name="modoInicio" checked={modoInicio === 'programar'} onChange={() => setModoInicio('programar')} />
              <span><strong>Programar</strong><br /><small>Elegí una fecha y hora futura.</small></span>
            </label>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          {modoInicio === 'programar' && <div>
            <label style={labelStyle}>Fecha y hora de inicio *</label>
            <input type="datetime-local" min={toLocalDatetimeInput(new Date(Date.now() + 120_000))} value={form.fechaInicio} onChange={set('fechaInicio')} required style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
          </div>}
          <div>
            <label style={labelStyle}>Fecha de fin *</label>
            <input type="datetime-local" min={(modoInicio === 'ahora' ? toLocalDatetimeInput(new Date(Date.now() + 2 * 60_000)) : form.fechaInicio) || undefined} value={form.fechaFin} onChange={set('fechaFin')} required style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
          </div>
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: 'var(--space-3)',
          background: 'var(--color-primary)', color: '#fff',
          border: 'none', borderRadius: 'var(--radius-sm)',
          fontSize: '0.95rem', fontWeight: 600,
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Creando y cargando...' : modoInicio === 'ahora' ? 'Publicar ahora' : 'Programar subasta'}
        </button>
      </form>
    </div>
  );
}
