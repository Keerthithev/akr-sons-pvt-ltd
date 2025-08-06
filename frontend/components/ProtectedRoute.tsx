import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      const isAdmin = localStorage.getItem('isAdmin');

      if (!token || !isAdmin) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verify token with backend
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear localStorage
          localStorage.removeItem('adminToken');
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('adminName');
          localStorage.removeItem('adminEmail');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        // Clear invalid data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminName');
        localStorage.removeItem('adminEmail');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 