import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Loading } from '../components/common/FeedbackComponents';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <Loading text="Vérification de l'authentification..." />
      </div>
    );
  }

  // Rediriger vers login si non authentifié
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier si l'utilisateur est admin via user.is_admin (propriété, pas fonction)
  const isUserAdmin = user?.is_admin || false;

  // Si la route nécessite un admin et que l'utilisateur n'est pas admin
  if (requireAdmin && !isUserAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Tout est OK, afficher le contenu
  return children;
};

export default ProtectedRoute;