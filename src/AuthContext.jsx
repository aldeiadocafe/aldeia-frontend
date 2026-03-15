import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {

  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    return localStorage.getItem('auth-token') ? localStorage.getItem('auth-token') : null
  });

  const login = async (token, remember) => {    

    sessionStorage.setItem('auth-token', token);
    setUser(token);

    if (remember) {
      // PERSISTIR: Salva no localStorage (não apaga ao fechar)
      localStorage.setItem('auth-token', token);
    }

  };

  const logout = async () => {

    localStorage.removeItem('auth-token');
    sessionStorage.removeItem('auth-token');
    setUser(null);
//    navigate('/login');
  };


  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);