import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Space, Spin, message } from 'antd'
import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

import { updateUser } from '../../services/UserService';
import { getPasswordById } from '../../services/PasswordService'

const PasswordsComponent = () => {

    const { logout } = useAuth()

    const [form]    = Form.useForm();
    const { Item }  = Form;

    const {id: idPassword} = useParams();
    const { user, atualizarUser } = useAuth();

    const navigate = useNavigate();
    const [loading, setLoading]    = useState(false);

    const carregarDados = async () => {

      setLoading(true)

      await getPasswordById(idPassword).then((response) => {

        form.setFieldsValue({
          _id:    response.data.user._id,
          email:  response.data.user.email.toUpperCase(),
          nome:   response.data.user.nome.toUpperCase()
        })

      }).catch((err)=> {
        message.error(`Erro: ${err.response.data.message}!`);
      })

      setLoading(false)

    }

    //Gravar
    const handleFinish = async(values) => {

      const userData = {
        _id: values._id, 
        nome: values.nome.toUpperCase(),
        senha: values.senha
      }        

      setLoading(true);    

      updateUser (values._id, userData).then((response) => {

          atualizarUser(response.data);
          message.success('Registro atualizado com sucesso!')

          navigate('/')

      }).catch((error)=> {

          if (error.response) {
              message.error(error.response.data || 'Erro no servidor');
          } else {
              message.error('Erro ao criar!');
          }
      });

      setLoading(false);    

    }

    const handleCancel = async () => {

      await logout()
      navigate('/')

    }

    useEffect(() => {

      if (idPassword) {

        carregarDados()

      }

    }, [])

  return (
    <>
      <Spin
        spinning={loading}
        fullscreen
      />

      <Card 
        style={{ maxWidth: 400, 
                 margin: '50px auto',
                 color: 'var(--primary-color)'}}
        title="Alterar Senha">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Item
              name="_id"
              key={"_id"}
              style={{ display: 'none'}}
              >
              <Input/>
          </Item>
          <Item
              name="nome"
              key={"nome"}
              label="Nome"
              rules={[{ required: true, 
                        message: 'Informar seu nome' }]}
              >
              <Input 
                  disabled
                  style={{ textTransform: 'uppercase' }}
                  placeholder="Seu Nome"
                  prefix={<UserOutlined />} 
                  />
          </Item>
          <Item
              name="email"
              key={"email"}
              label="E-mail"
              >

              <Input 
                  disabled
                  prefix={<MailOutlined />} 
                  />

          </Item>
          <Item
              name="senha"
              key={"senha"}
              label="Nova Senha"
              rules={[{ required: true, 
                        message: 'Informar sua senha' }]}
              >
              <Input.Password
                prefix={<LockOutlined />}
                type="password"
                placeholder="Senha"
              />

          </Item>
          <Item>
                <Space>
                  <Button 
                      htmlType="button"
                      onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                  <Button 
                      type="primary" 
                      htmlType="submit"
                  >
                    Salvar
                  </Button>
                </Space>
          </Item>
        </Form>
      </Card>
    </>
  );

}

export default PasswordsComponent