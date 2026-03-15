import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/reset.css'; // Antd v5

import { useAuth } from '../AuthContext';
import { getLogin } from '../services/LoginService';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Login = () => {

  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {

    try {
      const loginAux = {
        email:  values.email.toString().toUpperCase(),
        senha:  values.senha
      }
      const res = await getLogin(loginAux)
/*
      // Armazena o token no localStorage
      if (values.remember) {
        // PERSISTIR: Salva no localStorage (não apaga ao fechar)
        localStorage.setItem('auth-token', res.data.token);
      } else {
        // SESSÃO: Salva no sessionStorage (apaga ao fechar)
        sessionStorage.setItem('auth-token', res.data.token);
      }
*/
      await login(res.data.token,values.remember ? values.remember : false);
      message.success(`Bem-vindo, ${values.email}!`);
//      window.location.href = '/';
      navigate('/')

    } catch (err) {
      message.error(`Erro ao logar: ${err.response.data.message}!`);
    }
  };

  useEffect(() => {
/*    
    // Verifica se o token existe no localStorage
    const token = localStorage.getItem('auth-token');
    if (token) {
        message.success(`Bem-vindo, ${values.email}!`);
        window.location.href = '/';
    }
*/        
  }, []);

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
            name="email"
            rules={[{ required: true, message: 'Por favor, insira seu e-mail!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="E-mail" size="large" />
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

export default Login;
