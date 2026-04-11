import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // Kicks the user out to the login screen securely
    return <Navigate to="/login" replace />;
  }

  return children;
}
