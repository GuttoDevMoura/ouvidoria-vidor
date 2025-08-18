import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireAgent?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requireAgent = false 
}: ProtectedRouteProps) => {
  const { user, loading, isAdmin, isAgent } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirecionar para login se não estiver autenticado
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Se requer admin, verificar se é admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Se requer agent (ou admin), verificar se tem pelo menos um dos roles
  if (requireAgent && !isAdmin && !isAgent) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};