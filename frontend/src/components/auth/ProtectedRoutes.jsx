import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Unauthorized from '../../pages/auth/Unauthorized';

export default function ProtectedRoute({ children, is_admin = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si un rôle est requis, vérifier les permissions
  if (is_admin) {
    // Vérifier si l'utilisateur a le rôle requis
    const hasRequiredRole = user.is_admin === true;

    if (!hasRequiredRole) {
      return <Unauthorized />;
    }
  }

  return children;
}