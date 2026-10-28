import { useCallback, useEffect, useState } from 'react';
import { BellRing, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { alertasInteresApi } from '../api/alertasInteres';
import type { AlertaInteres, AlertaInteresRequest } from '../types';
import { CATEGORIAS } from '../utils/constants';

const emptyForm: AlertaInteresRequest = {
  categoria: '', marca: '', palabrasClave: '', precioMin: undefined, precioMax: undefined,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: 'var(--space-3) var(--space-4)',
  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
  fontSize: '0.9rem', outline: 'none', background: 'var(--color-surface)',
};

export default function AlertasInteresPage() {
  const [alertas, setAlertas] = useState<AlertaInteres[]>([]);
  const [form, setForm] = useState<AlertaInteresRequest>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setAlertas(await alertasInteresApi.listar());
      setError(null);
    } catch (e: unknown) {
      setError((e as { mensaje?: string }).mensaje ?? 'No se pudieron cargar tus alertas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const actualizarCampo = (campo: keyof AlertaInteresRequest, valor: string) => {
    setForm(actual => ({
      ...actual,
      [campo]: campo === 'precioMin' || campo === 'precioMax'
        ? (valor === '' ? undefined : Number(valor))
        : valor,
    }));
  };

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await alertasInteresApi.crear({
        ...form,
        categoria: form.categoria.trim(),
        marca: form.marca?.trim() || undefined,
        palabrasClave: form.palabrasClave?.trim() || undefined,
      });
      setForm(emptyForm);
      setSuccess(true);
      await cargar();
    } catch (e: unknown) {
      setError((e as { mensaje?: string }).mensaje ?? 'No se pudo crear la alerta');
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstado = async (alerta: AlertaInteres) => {
    try {
      await alertasInteresApi.actualizar(alerta.id, {
        categoria: alerta.categoria ?? '',
        marca: alerta.marca,
        palabrasClave: alerta.palabrasClave,
        precioMin: alerta.precioMin,
        precioMax: alerta.precioMax,
        activa: !alerta.activa,
      });
      await cargar();
    } catch (e: unknown) {
      setError((e as { mensaje?: string }).mensaje ?? 'No se pudo actualizar la alerta');
    }
  };

  const eliminar = async (id: number) => {
    try {
      await alertasInteresApi.eliminar(id);
      await cargar();
    } catch (e: unknown) {
      setError((e as { mensaje?: string }).mensaje ?? 'No se pudo eliminar la alerta');
    }
  };

  const input = (label: string, key: keyof AlertaInteresRequest, placeholder: string, type = 'text') => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: '0.85rem', fontWeight: 600 }}>
      {label}
      <input
        type={type}
        value={String(form[key] ?? '')}
        onChange={e => actualizarCampo(key, e.target.value)}
        placeholder={placeholder}
        min={type === 'number' ? '0' : undefined}
        step={type === 'number' ? '0.01' : undefined}
        style={inputStyle}
      />
    </label>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
        <BellRing color="var(--color-primary)" />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Alertas de interés</h1>
      </div>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
        Elegí una categoría obligatoria. Marca o palabras clave son opcionales: si completás ambas, alcanza con que coincida una. El precio, si lo indicás, también debe estar dentro del rango.
      </p>

      {error && <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--color-error-bg)', color: 'var(--color-error)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-5)' }}><AlertCircle size={16} />{error}</div>}
      {success && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--color-success-bg)', color: 'var(--color-success)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-5)' }}><CheckCircle size={16} />Alerta creada. Te avisaremos cuando haya coincidencias.</div>}

      <form onSubmit={crear} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 650, marginBottom: 'var(--space-5)' }}>Crear un filtro</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: '0.85rem', fontWeight: 600 }}>
            Categoría
            <select required value={form.categoria ?? ''} onChange={e => actualizarCampo('categoria', e.target.value)} style={inputStyle}>
              <option value="">Seleccionar categoría...</option>
              {CATEGORIAS.map(categoria => <option key={categoria} value={categoria}>{categoria}</option>)}
            </select>
          </label>
          {input('Marca', 'marca', 'Toyota, Apple...')}
          {input('Palabras clave', 'palabrasClave', 'SUV, notebook...')}
          {input('Precio mínimo', 'precioMin', '0', 'number')}
          {input('Precio máximo', 'precioMax', 'Sin límite', 'number')}
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 'var(--space-3) 0' }}>
          Los precios se comparan con el precio inicial de la subasta.
        </p>
        <button type="submit" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-5)', background: 'var(--color-primary)', color: '#fff', border: 0, borderRadius: 'var(--radius-sm)', fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
          <Plus size={17} />{saving ? 'Guardando...' : 'Crear alerta'}
        </button>
      </form>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 650, marginBottom: 'var(--space-4)' }}>Tus filtros</h2>
      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-8)' }}><div className="spinner" /></div> : alertas.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-8)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>Todavía no creaste alertas.</div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {alertas.map(alerta => {
            const criterios = [alerta.categoria, alerta.marca, alerta.palabrasClave].filter(Boolean);
            if (alerta.precioMin != null || alerta.precioMax != null) criterios.push(`$${alerta.precioMin ?? 0} – ${alerta.precioMax != null ? `$${alerta.precioMax}` : 'sin máximo'}`);
            return (
              <article key={alerta.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{criterios.join(' · ')}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: 'var(--space-1)' }}>{alerta.activa ? 'Notificaciones activadas' : 'Pausada'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={alerta.activa} onChange={() => void cambiarEstado(alerta)} /> Activa
                  </label>
                  <button type="button" aria-label="Eliminar alerta" onClick={() => void eliminar(alerta.id)} style={{ color: 'var(--color-error)', display: 'flex', padding: 'var(--space-2)' }}><Trash2 size={18} /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
