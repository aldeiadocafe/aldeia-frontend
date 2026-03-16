import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {

  const navigate = useNavigate();

  const [token, setToken] = useState(() => {
    return localStorage.getItem('auth-token') ? localStorage.getItem('auth-token') : null    
  });

  const [nome, setNome] = useState(() => {
    return localStorage.getItem('auth-nome') ? localStorage.getItem('auth-nome') : null
  });

  const login = async (dados, remember) => {  

    sessionStorage.setItem('auth-token', dados.token);
    setToken(token);

    sessionStorage.setItem('auth-nome', dados.user.nome);
    setNome(dados.user.nome);

    if (remember) {
      // PERSISTIR: Salva no localStorage (não apaga ao fechar)
      localStorage.setItem('auth-token', dados.token);
      localStorage.setItem('auth-nome', dados.user.nome);
    }

  };

  const logout = async () => {

    localStorage.removeItem('auth-token');
    sessionStorage.removeItem('auth-token');
    setToken(null);
    localStorage.removeItem('auth-nome');
    sessionStorage.removeItem('auth-nome');
    setNome(null);
//    navigate('/login');
  };


  return (
    <AuthContext.Provider value={{ user: token, nome, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);