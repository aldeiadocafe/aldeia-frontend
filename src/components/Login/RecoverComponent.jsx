import { Form, Input, Button, Checkbox, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import emailjs from '@emailjs/browser';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/reset.css'; // Antd v5

import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserByEmail } from '../../services/UserService';
import { createPassword } from '../../services/PasswordService';
import { useState } from 'react';
import { API_URL } from '../../config/constant';

const { Title } = Typography;

const RecoverComponent = () => {

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {

    setLoading(true);

    try {

      // 1. Buscar o usuário pelo email
      await getUserByEmail(values.email).then(async (response) => {

        const usuario = response.data

        // 2. Criar solicitação de recuperação
        await createPassword({user: usuario[0]}).then((resp) => {

          const pw = resp.data

          emailjs.send(
            "service_umls6wu",
            "template_s7r5d5d",{
            user_name: usuario[0].nome,
            link: `${API_URL}password/${pw._id}`,
            email: usuario[0].email},
            'fhQYQ-Ntr84l_55IR')       
          .then(
            (result) => {
              setLoading(false);
              message.success('Solicitação enviada com sucesso!');
              navigate('/')
            },
            (error) => {
              setLoading(false);
              console.log(error);
              message.error('Falha ao enviar solicitação, por favor tente novamente.');
            }
          );
          
        })
      })
    } catch (err) {
      setLoading(false);
      message.error(`Erro ao enviar solicitação: ${err.response.data.message}!`);
    }


  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">

      <Spin
//            percent={"auto"}
          spinning={loading}
          fullscreen
      />

      <Card className="shadow-lg" style={{ width: 400 }}>

        <div className="text-center mb-4">
          <Title level={1}>
            Acesse sua conta</Title>
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
          
          <Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-100" size="large">
                Enviar link de recuperação
              </Button>
            </Form.Item>
            <a className="float-end" href="/">Voltar para login</a>
          </Form.Item>

        </Form>
      </Card>
    </div>
  );
};

export default RecoverComponent;
