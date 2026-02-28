// Reusable component: shared UI behavior for ProtectedRoute.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ role = 'customer', children }) {
  const { customer, admin } = useAuth();

  if (role === 'admin' && !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (role === 'customer' && !customer) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;


