import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bell, User, Gavel, PlusCircle, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { notificacionesApi } from '../api/notificaciones';
import { useEffect } from 'react';

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const list = await notificacionesApi.noLeidas();
        setUnreadCount(list.length);
      } catch {
        // ignore
      }
    };
    load();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header style={{
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-primary)' }}>
          <Gavel size={24} />
          <span>SubastasRT</span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }} className="desktop-nav">
          <Link to="/" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-secondary)', transition: 'color var(--transition)' }}>
            Subastas
          </Link>
          {user && (
            <>
              {(hasRole('VENDEDOR') || hasRole('ADMIN')) && (
                <>
                  <Link to="/crear-subasta" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                    <PlusCircle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                    Crear
                  </Link>
                  <Link to="/mis-subastas" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                    Mis subastas
                  </Link>
                </>
              )}
              <Link to="/mis-pujas" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                Mis pujas
              </Link>
              <Link to="/seguimientos" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                Seguimientos
              </Link>
              {hasRole('ADMIN') && (
                <Link to="/admin" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                  <LayoutDashboard size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {user ? (
            <>
              <Link to="/notificaciones" style={{ position: 'relative', color: 'var(--color-text-secondary)' }}>
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -6, right: -6,
                    background: 'var(--color-error)', color: '#fff',
                    fontSize: '0.65rem', fontWeight: 700,
                    width: '18px', height: '18px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)' }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 600, fontSize: '0.85rem',
                  }}>
                    {user.nombre[0]}{user.apellido[0]}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {user.nombre}
                  </span>
                </button>
                {mobileOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: 'var(--space-2)',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                    minWidth: 200, padding: 'var(--space-2)', zIndex: 60,
                  }}>
                    <div style={{ padding: 'var(--space-2)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      @{user.username}
                    </div>
                    <Link to="/mi-perfil" onClick={() => setMobileOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                      padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.9rem', color: 'var(--color-text-secondary)',
                    }}>
                      <User size={16} /> Mi perfil
                    </Link>
                    <button onClick={() => { setMobileOpen(false); handleLogout(); }} style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%',
                      padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.9rem', color: 'var(--color-error)',
                    }}>
                      <LogOut size={16} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <button style={{
                  padding: 'var(--space-2) var(--space-4)', fontSize: '0.85rem',
                  fontWeight: 500, color: 'var(--color-text-secondary)',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                  transition: 'all var(--transition)',
                }}>
                  Iniciar sesión
                </button>
              </Link>
              <Link to="/registro">
                <button style={{
                  padding: 'var(--space-2) var(--space-4)', fontSize: '0.85rem',
                  fontWeight: 500, color: '#fff',
                  background: 'var(--color-primary)',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all var(--transition)',
                }}>
                  Registrarse
                </button>
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: 'none', color: 'var(--color-text-secondary)' }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="mobile-nav" style={{
          padding: 'var(--space-4)', borderTop: '1px solid var(--color-border)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
        }}>
          <Link to="/" onClick={() => setMobileOpen(false)}>Subastas</Link>
          {user && (
            <>
              {(hasRole('VENDEDOR') || hasRole('ADMIN')) && (
                <>
                  <Link to="/crear-subasta" onClick={() => setMobileOpen(false)}>Crear subasta</Link>
                  <Link to="/mis-subastas" onClick={() => setMobileOpen(false)}>Mis subastas</Link>
                </>
              )}
              <Link to="/mis-pujas" onClick={() => setMobileOpen(false)}>Mis pujas</Link>
              <Link to="/seguimientos" onClick={() => setMobileOpen(false)}>Seguimientos</Link>
              <Link to="/mi-perfil" onClick={() => setMobileOpen(false)}>Mi perfil</Link>
              {hasRole('ADMIN') && (
                <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin</Link>
              )}
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
