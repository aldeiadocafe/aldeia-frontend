import React from 'react';
import { Form, Input, Button, DatePicker, Select } from 'antd';

const { Option } = Select;

const Teste = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Dados do formulário:', values);
  };

  // Estilo para garantir que o Form.Item preencha todo o espaço flex
  const formItemStyle = {
    flex: 1, // Distribui espaço igualmente
    marginBottom: 0,
    marginRight: 16,
  };

  return (
    <div style={{ padding: 24 }}>
      <Form
        form={form}
        layout="inline"
        onFinish={onFinish}
        style={{ display: 'flex', width: '100%' }} // Flex container ocupando 100%
      >
        {/* Campo 1 */}
        <Form.Item name="nome" style={formItemStyle}>
          <Input placeholder="Nome" />
        </Form.Item>

        {/* Campo 2 */}
        <Form.Item name="email" style={formItemStyle}>
          <Input placeholder="E-mail" />
        </Form.Item>

        {/* Campo 3 */}
        <Form.Item name="data" style={formItemStyle}>
          <DatePicker style={{ width: '100%' }} placeholder="Data" />
        </Form.Item>

        {/* Campo 4 */}
        <Form.Item name="status" style={formItemStyle}>
          <Select placeholder="Status">
            <Option value="ativo">Ativo</Option>
            <Option value="inativo">Inativo</Option>
          </Select>
        </Form.Item>

        {/* Botão sem margin-right final */}
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit">
            Enviar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Teste;
