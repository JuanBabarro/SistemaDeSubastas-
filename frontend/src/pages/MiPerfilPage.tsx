import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usuariosApi } from '../api/usuarios';
import type { UsuarioResponse } from '../types';
import { formatDate } from '../utils/format';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function MiPerfilPage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ nombre: user.nombre, apellido: user.apellido, email: user.email });
      setLoading(false);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await usuariosApi.actualizarPerfil(form);
      setSuccess(true);
      setEditing(false);
    } catch (err: unknown) {
      setError((err as { mensaje?: string }).mensaje ?? 'Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: 'var(--space-3) var(--space-4)',
    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
    fontSize: '0.9rem', outline: 'none',
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}><div className="spinner" /></div>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
        Mi perfil
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
        Gestioná tus datos personales
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
          <CheckCircle size={16} /> Perfil actualizado correctamente
        </div>
      )}

      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)',
      }}>
        {/* Avatar */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--color-primary-light)', color: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-6)',
        }}>
          {user.nombre[0]}{user.apellido[0]}
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Username</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>@{user.username}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Rol</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{user.rol}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Fecha de registro</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{formatDate(user.fechaRegistro)}</div>
          </div>

          {editing ? (
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>Nombre</label>
                  <input type="text" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>Apellido</label>
                  <input type="text" value={form.apellido} onChange={e => setForm(p => ({ ...p, apellido: e.target.value }))} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required style={inputStyle} />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button type="submit" disabled={saving} style={{
                    padding: 'var(--space-2) var(--space-4)',
                    background: 'var(--color-primary)', color: '#fff',
                    border: 'none', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem', fontWeight: 600,
                  }}>
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} style={{
                    padding: 'var(--space-2) var(--space-4)',
                    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem', color: 'var(--color-text-secondary)',
                  }}>
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Nombre</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{user.nombre} {user.apellido}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Email</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{user.email}</div>
              </div>
              <button onClick={() => setEditing(true)} style={{
                marginTop: 'var(--space-4)', padding: 'var(--space-2) var(--space-4)',
                background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                border: 'none', borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem', fontWeight: 600, alignSelf: 'flex-start',
              }}>
                Editar perfil
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
