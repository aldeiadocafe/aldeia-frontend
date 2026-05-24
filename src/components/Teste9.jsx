import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card } from 'antd';

const { Content } = Layout;
const { Title, Text } = Typography;

const Teste = () => {
  // 1. Estado para armazenar as dimensões
  const [dimensoes, setDimensoes] = useState({
    largura: window.innerWidth,
    altura: window.innerHeight,
  });

  // 2. Efeito para atualizar as dimensões quando a tela for redimensionada
  useEffect(() => {
    const handleResize = () => {
      setDimensoes({
        largura: window.innerWidth,
        altura: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Limpa o listener ao desmontar o componente
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Layout style={{ padding: '24px', minHeight: '100vh' }}>
      <Content>
        <Card title="Dimensões da Tela (Ant Design)">
          <Title level={4}>Largura: <Text type="success">{dimensoes.largura}px</Text></Title>
          <Title level={4}>Altura: <Text type="success">{dimensoes.altura}px</Text></Title>
          <p>Redimensione a janela para ver os valores mudarem.</p>
        </Card>
      </Content>
    </Layout>
  );
};

export default Teste;
