import React, { useState } from 'react';
import { Table, Input, Button, Checkbox, Space, InputNumber, Card, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; // Importante para v5+

const { Title } = Typography;

const Teste = () => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Função para adicionar item
  const addItem = () => {
    if (name.trim() === '') return;
    
    const newItem = {
      key: Date.now(), // ID único
      name: name,
      quantity: quantity,
      purchased: false,
    };
    
    setItems([...items, newItem]);
    setName(''); // Limpa input
    setQuantity(1); // Reseta quantidade
  };

  // Função para marcar/desmarcar comprado
  const togglePurchased = (key) => {
    setItems(
      items.map((item) =>
        item.key === key ? { ...item, purchased: !item.purchased } : item
      )
    );
  };

  // Função para excluir item
  const deleteItem = (key) => {
    setItems(items.filter((item) => item.key !== key));
  };

  // Configuração das colunas da tabela
  const columns = [
    {
      title: 'Comprado',
      dataIndex: 'purchased',
      key: 'purchased',
      width: 100,
      render: (purchased, record) => (
        <Checkbox 
          checked={purchased} 
          onChange={() => togglePurchased(record.key)} 
        />
      ),
    },
    {
      title: 'Item',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span style={{ textDecoration: record.purchased ? 'line-through' : 'none', color: record.purchased ? '#999' : '#000' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
    },
    {
      title: 'Ações',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => deleteItem(record.key)} 
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 50, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Card style={{ maxWidth: 800, margin: '0 auto', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Title level={3}>🛒 Minha Lista de Compras</Title>
        
        {/* Área de Inclusão de Item */}
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Input 
            placeholder="Nome do item" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            style={{ width: 300 }}
          />
          <InputNumber 
            min={1} 
            value={quantity} 
            onChange={(value) => setQuantity(value)} 
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={addItem}
          >
            Adicionar
          </Button>
        </Space>

        {/* Tabela de Itens */}
        <Table 
          columns={columns} 
          dataSource={items} 
          pagination={false}
          rowClassName={(record) => (record.purchased ? 'row-purchased' : '')}
        />
      </Card>
      
      {/* CSS simples para a linha riscada */}
      <style>{`
        .row-purchased {
          background-color: #fffded;
        }
      `}</style>
    </div>
  );
};

export default Teste;
