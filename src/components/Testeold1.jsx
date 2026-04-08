import React, { useState } from 'react';
import { Table, Input, Button, Form, InputNumber, Space, Card, Typography, Checkbox } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Teste = () => {
  // Estado para armazenar os itens da lista
  const [lista, setLista] = useState([
    { id: 1, nome: 'Maçã', quantidade: 5 },
    { id: 2, nome: 'Pão', quantidade: 2 },
  ]);
  
  const [form] = Form.useForm();

  // Função para adicionar item
  const onFinish = (values) => {
    const novoItem = {
      id: Date.now(),
      nome: values.nome,
      quantidade: values.quantidade,
    };
    setLista([...lista, novoItem]);
    form.resetFields(); // Limpa o formulário após adicionar
  };

  // Função para remover item
  const removerItem = (id) => {
    setLista(lista.filter(item => item.id !== id));
  };

  // Configuração das colunas da tabela Antd
  const columns = [
    {
      title: 'Item',
      dataIndex: 'nome',
      key: 'nome',
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantidade',
      key: 'quantidade',
      width: '20%',
    },
    {
      title: 'Ação',
      key: 'action',
      render: (_, record) => (
        <Checkbox
        >
        <span style={{ textDecoration: true ? 'line-through' : 'none', color: true ? '#8c8c8c' : 'inherit' }}>
            {record.name}
        </span>
        </Checkbox>
/*        
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => removerItem(record.id)}
        >
          Remover
        </Button>
*/        
      ),
      width: '20%',
    },
  ];

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>Minha Lista de Compras</Title>
        
        {/* Formulário de Adição */}
        <Form
          form={form}
          layout="inline"
          onFinish={onFinish}
          style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}
        >
          <Form.Item
            name="nome"
            rules={[{ required: true, message: 'Digite o nome do item!' }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="Ex: Ovos" />
          </Form.Item>
          <Form.Item
            name="quantidade"
            initialValue={1}
            rules={[{ required: true, message: 'Qtd!' }]}
          >
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Adicionar
            </Button>
          </Form.Item>
        </Form>

        {/* Tabela de Listagem */}
        <Table 
          dataSource={lista} 
          columns={columns} 
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Teste;
