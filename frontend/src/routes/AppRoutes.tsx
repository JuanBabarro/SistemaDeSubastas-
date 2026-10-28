import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import LoginPage from '../pages/LoginPage';
import RegistroPage from '../pages/RegistroPage';
import HomePage from '../pages/HomePage';
import SubastaDetallePage from '../pages/SubastaDetallePage';
import CrearSubastaPage from '../pages/CrearSubastaPage';
import MisSubastasPage from '../pages/MisSubastasPage';
import MiPerfilPage from '../pages/MiPerfilPage';
import MisPujasPage from '../pages/MisPujasPage';
import SeguimientosPage from '../pages/SeguimientosPage';
import NotificacionesPage from '../pages/NotificacionesPage';
import AlertasInteresPage from '../pages/AlertasInteresPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';

function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas sin layout */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/registro" element={<GuestRoute><RegistroPage /></GuestRoute>} />

      {/* Rutas con layout */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/subasta/:id" element={<Layout><SubastaDetallePage /></Layout>} />

      {/* Rutas protegidas */}
      <Route path="/crear-subasta" element={
        <ProtectedRoute roles={['VENDEDOR', 'ADMIN']}>
          <Layout><CrearSubastaPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/mis-subastas" element={
        <ProtectedRoute roles={['VENDEDOR', 'ADMIN']}>
          <Layout><MisSubastasPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/mi-perfil" element={
        <ProtectedRoute>
          <Layout><MiPerfilPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/mis-pujas" element={
        <ProtectedRoute>
          <Layout><MisPujasPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/seguimientos" element={
        <ProtectedRoute>
          <Layout><SeguimientosPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/notificaciones" element={
        <ProtectedRoute>
          <Layout><NotificacionesPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/alertas-interes" element={
        <ProtectedRoute>
          <Layout><AlertasInteresPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute roles={['ADMIN']}>
          <Layout><AdminDashboardPage /></Layout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
