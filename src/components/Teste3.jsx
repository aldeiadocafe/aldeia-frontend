import React, { useState } from 'react';
import { Table, Input, Button, Form, Checkbox, InputNumber, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; // Importa os estilos do Ant Design v5

const { Title } = Typography;

const Teste = () => {
  const [form] = Form.useForm();
  const [list, setList] = useState([]);

  // Função para adicionar item à lista
  const onFinish = (values) => {
    const newItem = {
      key: Date.now(),
      name: values.name,
      quantity: values.quantity || 1,
      purchased: false,
    };
    setList([...list, newItem]);
    form.resetFields(); // Limpa o formulário
  };

  // Função para marcar/desmarcar item como comprado
  const togglePurchased = (key) => {
    setList(
      list.map((item) =>
        item.key === key ? { ...item, purchased: !item.purchased } : item
      )
    );
  };

  // Função para remover item
  const removeItem = (key) => {
    setList(list.filter((item) => item.key !== key));
  };

  // Definição das colunas da tabela
  const columns = [
    {
      title: 'Comprado',
      dataIndex: 'purchased',
      key: 'purchased',
      width: '10%',
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
        <span style={{ textDecoration: record.purchased ? 'line-through' : 'none', color: record.purchased ? '#aaa' : '#000' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Qtd',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '15%',
    },
    {
      title: 'Ações',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.key)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}><ShoppingCartOutlined /> Lista de Compras</Title>
      
      {/* Formulário de Inclusão */}
      <Form
        form={form}
        layout="inline"
        onFinish={onFinish}
        style={{ marginBottom: 20, justifyContent: 'space-between', background: '#f5f5f5', padding: 15, borderRadius: 8 }}
      >
        <Space>
          <Form.Item 
            name="name" 
            label="Produto"
            rules={[{ required: true, message: 'Digite o item!' }]}
            >
            <Input placeholder="Nome do item" style={{ width: 250 }} />
          </Form.Item>
          <Form.Item 
            name="quantity" 
            label="Qtde no Estoq"
            initialValue={1}>
            <InputNumber min={1} placeholder="Qtd" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Adicionar
            </Button>
          </Form.Item>
        </Space>
      </Form>

      {/* Tabela de Itens */}
      <Table
        columns={columns}
        dataSource={list}
        pagination={false}
        bordered
        summary={() => (
            <Table.Summary.Row>
                <Table.Summary.Cell colSpan={4}>
                    <Typography.Text strong>Total de itens: {list.length}</Typography.Text>
                </Table.Summary.Cell>
            </Table.Summary.Row>
        )}
      />
    </div>
  );
};

export default Teste;
