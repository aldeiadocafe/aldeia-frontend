import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  
  const [user, setUser] = useState(localStorage.getItem('auth-token'));
  const navigate = useNavigate();
  
  const login = (token) => {
    localStorage.setItem('auth-token', token);
    setUser(token);
    navigate('/dashboard'); // Redireciona após login
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);