import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {

  const login = async (dados, remember) => {  

    // Uso: 10 minutos = 600000 ms
    setWithExpiry('auth-expiry', remember, 86400000); // 24 horas = 86400000 ms

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

    localStorage.removeItem  ('auth-token');
    sessionStorage.removeItem('auth-token');

    localStorage.removeItem  ('auth-expiry');
    sessionStorage.removeItem('auth-expiry');

    localStorage.removeItem  ('auth-user');
    sessionStorage.removeItem('auth-user');

    setUser(null);
    setToken(null);
//    navigate('/login');
  };

  const atualizarUser = async (dados) => {

    sessionStorage.setItem('auth-user', JSON.stringify(dados));
    setUser(dados);

    if (localStorage.getItem('auth-user')) {
      localStorage.setItem('auth-user', JSON.stringify(dados));
    }

  }

  // 1. Definir o item com tempo (ex: 10 minutos)
  const setWithExpiry = (key, remember, ttl) => {
    const now = new Date();
    const item = {
      expiry: now.getTime() + ttl,
    };

    sessionStorage.setItem(key, JSON.stringify(item));
    if (remember) {
      localStorage.setItem(key, JSON.stringify(item));
    }

  };

  // 2. Obter o item e verificar se expirou
  const getWithExpiry = (key) => {

    let itemStr

    itemStr = sessionStorage.getItem(key);
    if (localStorage.getItem(key)) 
      itemStr = localStorage.getItem(key);

    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      logout()
      return null;
    }

    return item.expiry;
  };

  const [token, setToken] = useState(() => {

    const tokenExpiry = getWithExpiry('auth-expiry');
    if (!tokenExpiry) return null

    const tokenData = localStorage.getItem('auth-token') ? localStorage.getItem('auth-token') : null
    return tokenData ? tokenData : null
//    return localStorage.getItem('auth-token') ? localStorage.getItem('auth-token') : null    
  });

  const [user, setUser] = useState(() => {

    const tokenExpiry = getWithExpiry('auth-expiry');
    if (!tokenExpiry) return null

    const userData = localStorage.getItem('auth-user') ? localStorage.getItem('auth-user') : null
    return userData ? JSON.parse(userData) : null
//    return localStorage.getItem('auth-user') ? localStorage.getItem('auth-user') : null
  });
  
  return (
    <AuthContext.Provider value={{ token, user, login, logout, atualizarUser }}>  {/* São os campos "globais" do contexto e as funções */}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);