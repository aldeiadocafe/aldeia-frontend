import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/reset.css'; // Antd v5

import { useAuth } from './AuthContext';
import { getLogin } from '../../services/LoginService';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const LoginComponent = () => {

  const { login, user } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {

    try {
      const loginAux = {
        nome:   values.nome.toString().toUpperCase(),
        senha:  values.senha
      }
      const res = await getLogin(loginAux)

      await login(res.data,values.remember ? values.remember : false);
      message.success(`Bem-vindo, ${res.data.user.nome}!`);
//      window.location.href = '/';
      navigate('/')

    } catch (err) {
      message.error(`Erro ao logar: ${err.response.data.message}!`);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <Card className="shadow-lg" style={{ width: 400 }}>
        <div className="text-center mb-4">
          <Title 
            level={1}
            >Login</Title>
        </div>
        
        <Form
          name="normal_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="nome"
            rules={[{ required: true, message: 'Por favor, insira seu nome!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nome" size="large" />

          </Form.Item>
          
          <Form.Item
            name="senha"
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
            <a className="float-end" href="/recover">Esqueci minha senha</a>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-100" size="large">
              Entrar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginComponent;
