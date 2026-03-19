import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState(() => {
    const tokenData = localStorage.getItem('auth-token') ? localStorage.getItem('auth-token') : null
    return tokenData ? tokenData : null
//    return localStorage.getItem('auth-token') ? localStorage.getItem('auth-token') : null    
  });

  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('auth-user') ? localStorage.getItem('auth-user') : null
    return userData ? JSON.parse(userData) : null
//    return localStorage.getItem('auth-user') ? localStorage.getItem('auth-user') : null
  });

  const login = async (dados, remember) => {  

    sessionStorage.setItem('auth-token', dados.token);
    setToken(dados.token);

    sessionStorage.setItem('auth-user', JSON.stringify(dados.user));
    setUser(dados.user);

    if (remember) {
      // PERSISTIR: Salva no localStorage (não apaga ao fechar)
      localStorage.setItem('auth-token', dados.token);
      localStorage.setItem('auth-user', JSON.stringify(dados.user));
    }

  };

  const logout = async () => {

    localStorage.removeItem('auth-token');
    sessionStorage.removeItem('auth-token');
    setToken(null);

    localStorage.removeItem('auth-user');
    sessionStorage.removeItem('auth-user');
    setUser(null);
//    navigate('/login');
  };

  const atualizarUser = async (dados) => {

    sessionStorage.setItem('auth-user', JSON.stringify(dados));
    setUser(dados);

    if (localStorage.getItem('auth-user')) {
      localStorage.setItem('auth-user', JSON.stringify(dados));
    }

  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, atualizarUser }}>  {/* São os campos "globais" do contexto e as funções */}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);