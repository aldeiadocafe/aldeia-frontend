import React from 'react';
import { Column } from '@ant-design/plots';


const Teste = () => {

  const data = [
    { type: 'Janeiro', sales: 10.12 },
    { type: 'Fevereiro', sales: 15.32 },
    { type: 'Março', sales: 8.45 },
  ];

  const config = {
    data,
    xField: 'type',
    yField: 'sales',
    // Configuração dos Eixos
    axis: {
//      x: {
//        labelFormatter: (val) => Math.floor(Number(val)).toString(), // Garante inteiro no X se for numérico
//      },
      y: {
        // Formata os valores do eixo Y para exibir apenas inteiros
        labelFormatter: (val) => Math.floor(Number(val)).toString(),
        // Opcional: define o número de divisões (ticks) para ajudar a manter inteiro
        tickCount: 5, 
      },
    },
  };

  return <Column {...config} />;

};

export default Teste;
