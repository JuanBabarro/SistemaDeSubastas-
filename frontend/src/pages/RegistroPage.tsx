import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Gavel, AlertCircle } from 'lucide-react';

export default function RegistroPage() {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', apellido: '', username: '', email: '', password: '', rol: 'POSTOR' as 'POSTOR' | 'VENDEDOR' });
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      await register(form);
      navigate('/');
    } catch {
      // error set by context
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

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--color-bg)', padding: 'var(--space-6)',
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)', padding: 'var(--space-10)',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
            color: 'var(--color-primary)', fontWeight: 700, fontSize: '1.5rem', marginBottom: 'var(--space-2)',
          }}>
            <Gavel size={28} />
            SubastasRT
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Creá tu cuenta para pujar o publicar subastas
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            background: 'var(--color-error-bg)', color: 'var(--color-error)',
            padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-6)', fontSize: '0.85rem',
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>Nombre</label>
              <input type="text" value={form.nombre} onChange={set('nombre')} required style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>Apellido</label>
              <input type="text" value={form.apellido} onChange={set('apellido')} required style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>Username</label>
            <input type="text" value={form.username} onChange={set('username')} required minLength={3} maxLength={50} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>Email</label>
            <input type="email" value={form.email} onChange={set('email')} required style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>Contraseña (mín. 8 caracteres)</label>
            <input type="password" value={form.password} onChange={set('password')} required minLength={8} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label htmlFor="rol" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>Tipo de cuenta</label>
            <select id="rol" value={form.rol} onChange={set('rol')} style={inputStyle}>
              <option value="POSTOR">Postor — participar en subastas</option>
              <option value="VENDEDOR">Vendedor — participar y crear subastas</option>
            </select>
            <small style={{ display: 'block', marginTop: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
              Los permisos de administrador son asignados únicamente por el sistema.
            </small>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 'var(--space-3)',
            background: 'var(--color-primary)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-sm)',
            fontSize: '0.95rem', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
