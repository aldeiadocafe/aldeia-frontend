import React from 'react';
import { Grid, Typography } from 'antd';

const { useBreakpoint } = Grid;
const { Text } = Typography;

const Teste = () => {
  // Pega o estado atual da tela (ex: { xs: true, sm: true, md: false, lg: false })
  const screens = useBreakpoint();

  // Tablet ou Computador (md, lg, xl, xxl)
  const isDesktopOrTablet = screens.md;

  return (
    <div>
      {isDesktopOrTablet ? (
        <Text type="success">Você está usando um Computador ou Tablet!</Text>
      ) : (
        <Text type="warning">Você está usando um Smartphone!</Text>
      )}
    </div>
  );
};

export default Teste;