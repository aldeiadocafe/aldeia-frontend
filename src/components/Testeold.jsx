import React, { useState } from 'react';
import { Input, Button, List, Checkbox, Typography, Space, Card, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; // Importante para versões mais novas da Antd

const { Title } = Typography;

const Teste = () => {

  const [items, setItems] = useState([
    { id: 1, name: 'Pão de Forma', quantidade: 10, bought: false },
    { id: 2, name: 'Leite Integral', quantidade: 0, bought: true },
  ]);
  const [newItemName, setNewItemName] = useState('');

  // Adicionar novo item
  const addItem = () => {
    if (newItemName.trim()) {
      setItems([...items, { id: Date.now(), name: newItemName, bought: false }]);
      setNewItemName('');
    }
  };

  // Alternar status de comprado
  const toggleBought = (id) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, bought: !item.bought } : item
      )
    );
  };

  // Remover item
  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div style={{ padding: '30px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12}>
          <Card>
            <Title level={2} style={{ textAlign: 'center' }}>Lista de Compras</Title>
            
            <Space style={{ width: '100%', marginBottom: 16 }} direction="horizontal">
              <Input
                placeholder="Novo item"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onPressEnter={addItem}
              />
              <InputNumber
                step={1}
                decimalSeparator=','
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onPressEnter={addItem}
                />

              <Button type="primary" icon={<PlusOutlined />} onClick={addItem}>
                Adicionar
              </Button>
            </Space>

            <List
              bordered
              dataSource={items}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => removeItem(item.id)} 
                    />,
                  ]}
                >
                  <Checkbox
                    checked={item.bought}
                    onChange={() => toggleBought(item.id)}
                  >
                    <span style={{ textDecoration: item.bought ? 'line-through' : 'none', color: item.bought ? '#8c8c8c' : 'inherit' }}>
                      {item.name}
                    </span>
                  </Checkbox>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Teste;
