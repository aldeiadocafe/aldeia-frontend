import React from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/reset.css'; // Antd v5

const { Title } = Typography;

const Teste = () => {
    
  const onFinish = (values) => {
    console.log('Dados do formulário:', values);
    // Exemplo de feedback do Ant Design
    message.success(`Bem-vindo, ${values.username}!`);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <Card className="shadow-lg" style={{ width: 400 }}>
        <div className="text-center mb-4">
          <Title level={2}>Login</Title>
        </div>
        
        <Form
          name="normal_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Por favor, insira seu usuário!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Usuário" size="large" />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              type="password"
              placeholder="Senha"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Lembrar-me</Checkbox>
            </Form.Item>
            <a className="float-end" href="/">Esqueci minha senha</a>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-100" size="large">
              Entrar
            </Button>
            <div className="text-center mt-3">
                Ou <a href="/">registre-se agora!</a>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Teste;
