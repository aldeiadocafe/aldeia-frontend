import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const PrivateRoute = ({ children }) => {

  const { user } = useAuth();

  if (user === null) {
    return <Navigate to="/login" />;
  } else {
    return children;
  }
//  return user ? children : <Navigate to="/login" />;
//  return children

};