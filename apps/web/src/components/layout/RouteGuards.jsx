import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { PageLoader } from '../ui/LoadingState.jsx';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Vérification de la session" />;
  if (!user) return <Navigate to="/connexion" replace state={{ from: location }} />;
  return <Outlet />;
}

export function RoleRoute({ role }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader label="Contrôle des autorisations" />;
  if (!user) return <Navigate to="/connexion" replace />;
  if (user.role !== role) return <Navigate to="/tableau-de-bord" replace />;
  return <Outlet />;
}
