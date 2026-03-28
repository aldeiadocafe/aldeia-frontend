import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { getAllCompanys } from '../services/CompanyService'

const Teste = () => {
    
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

    // 1. Define uma função assíncrona
    const fetchDataSequentially = async () => {
      try {
        setLoading(true);
        // 2. Primeira requisição
//        const firstResponse = await axios.get('http://localhost:5000/api/v1/units');
        const firstResponse = await getAllCompanys()
        const userId = firstResponse.data;

        // 3. Segunda requisição dependente da primeira
        const secondResponse = await axios.get(`http://localhost:5000/api/v1/inventorys`);
        
        setData(secondResponse.data);
console.log(firstResponse.data, secondResponse.data)        
      } catch (error) {
        console.error('Erro na requisição:', error);
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {

    fetchDataSequentially();
  }, []); // [] garante que a requisição ocorra apenas na montagem

  if (loading) return <div>Carregando...</div>;
  return <div>{JSON.stringify(data)}</div>;

};

export default Teste;
