import React from 'react';
import { Grid, Typography } from 'antd';

const { useBreakpoint } = Grid;
const { Text } = Typography;

const Teste = () => {
  const screens = useBreakpoint();

  // Se a tela for 'lg' (desktop) ou maior
  const isDesktop = screens.lg; 
  
  // Se for 'md' (tablet) e menor que 'lg'
  const isTablet = screens.md && !screens.lg;

  return (
    <div>
      {isDesktop && <Text>Você está usando um Computador!</Text>}
      {isTablet && <Text>Você está usando um Tablet!</Text>}
      {!screens.md && <Text>Você está em um Celular!</Text>}
    </div>
  );
};

export default Teste;