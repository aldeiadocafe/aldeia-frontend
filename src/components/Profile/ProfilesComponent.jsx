import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Space, Spin, message } from 'antd'
import { useEffect, useState } from 'react';
import { useAuth } from '../Login/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateUser } from '../../services/UserService';

const ProfilesComponent = () => {

    const [form]    = Form.useForm();
    const { Item }  = Form;

    const { user, atualizarUser } = useAuth();

    const navigate = useNavigate();
    const [loading, setLoading]    = useState(false);

    //Gravar
    const handleFinish = async(values) => {

      const userData = {
        _id: values._id, 
        nome: values.nome.toUpperCase()};

      if (user.senha !== values.senha) {
        userData.senha = values.senha;
      }        

      setLoading(true);    

      updateUser(values._id, userData).then((response) => {

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

    const handleCancel = () => {
        form.resetFields();
    }

    useEffect(() => {

      if (user) {

        setLoading(true);

        form.setFieldsValue(user);

        setLoading(false);
      }
    }, []);

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
        title="Perfil do Usuário">
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
              rules={[
                { type: 'email',
                  message: 'O e-mail inserido não é válido!'
                },
                { required: true, 
                  message: 'Informar seu e-mail' }]}
              >

              <Input 
                  style={{ textTransform: 'uppercase' }}
//                  prefix={<MailOutlined />} 
                  />

          </Item>
          <Item
              name="senha"
              key={"senha"}
              label="Senha"
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

export default ProfilesComponent