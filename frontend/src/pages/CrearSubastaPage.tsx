import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subastasApi } from '../api/subastas';
import { CATEGORIAS } from '../utils/constants';
import { fromDatetimeLocal } from '../utils/format';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function CrearSubastaPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombreProducto: '',
    descripcionProducto: '',
    categoriaProducto: '',
    marcaProducto: '',
    modeloProducto: '',
    precioBase: '',
    incrementoMinimo: '',
    fechaInicio: '',
    fechaFin: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fotos, setFotos] = useState<File[]>([]);
  const [publicarAlCrear, setPublicarAlCrear] = useState(true);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        fechaInicio: fromDatetimeLocal(form.fechaInicio),
        fechaFin: fromDatetimeLocal(form.fechaFin),
      });
      subastaCreadaId = subasta.id;
      for (const foto of fotos) {
        await subastasApi.subirFoto(subasta.id, foto);
      }
      if (publicarAlCrear) {
        await subastasApi.publicar(subasta.id);
      }
      setSuccess(true);
      setTimeout(() => navigate(publicarAlCrear ? `/subasta/${subasta.id}` : '/mis-subastas'), 1200);
    } catch (err: unknown) {
      const mensaje = (err as { mensaje?: string }).mensaje ?? 'Error al crear la subasta';
      setError(subastaCreadaId
        ? `${mensaje}. La subasta quedó creada como borrador; revisala en “Mis subastas” y completá las fotos o publicación pendientes.`
        : mensaje);
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
          <CheckCircle size={16} /> {publicarAlCrear ? 'Subasta publicada correctamente.' : 'Borrador creado correctamente.'} Redirigiendo...
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
          <label htmlFor="fotos-subasta" style={labelStyle}>Fotos del producto (hasta 10, JPEG/PNG/WebP, máximo 5 MB cada una)</label>
          <input
            id="fotos-subasta"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          <div>
            <label style={labelStyle}>Fecha de inicio *</label>
            <input type="datetime-local" value={form.fechaInicio} onChange={set('fechaInicio')} required style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
          </div>
          <div>
            <label style={labelStyle}>Fecha de fin *</label>
            <input type="datetime-local" value={form.fechaFin} onChange={set('fechaFin')} required style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          <input type="checkbox" checked={publicarAlCrear} onChange={e => setPublicarAlCrear(e.target.checked)} />
          <span>Publicar al terminar de crear y cargar las fotos. Si la fecha de inicio es futura, quedará programada y aceptará pujas cuando comience.</span>
        </label>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: 'var(--space-3)',
          background: 'var(--color-primary)', color: '#fff',
          border: 'none', borderRadius: 'var(--radius-sm)',
          fontSize: '0.95rem', fontWeight: 600,
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Creando y cargando...' : publicarAlCrear ? 'Crear y publicar subasta' : 'Guardar como borrador'}
        </button>
      </form>
    </div>
  );
}
