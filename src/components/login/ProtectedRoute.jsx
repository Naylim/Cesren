/* eslint-disable react/prop-types */
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem('userRole');
    console.log(role);
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/acceso-denegado" replace />;
  }

  return children;
};

export default ProtectedRoute;
