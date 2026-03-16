import React, { useRef } from 'react';
import emailjs from '@emailjs/browser';
import { Form, Input, Button, message, Card } from 'antd';
import { MailOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';

const Email = () => {
  const formRef = useRef();
  const [form] = Form.useForm();

  const sendEmail = (values) => {

    // 1. Defina os parâmetros com as variáveis do template
    const templateParams = {
      email: values.user_email, // O nome capturado no formulário
      link: 'https://www.example.com', // Exemplo de link, pode ser dinâmico
//      message: message,
//      email: "destino@email.com" // opcional, se usar {{email}} no template
    };

    // values object contains {user_name, user_email, message}
/*    
    emailjs    
      .sendForm(
        'service_umls6wu',      //YOUR_SERVICE_ID
        'template_5mebi5m',     //YOUR_TEMPLATE_ID
        form.current,
        'fhQYQ-Ntr84l_55IR'      //YOUR_PUBLIC_KEY
      )
*/
emailjs.send("service_umls6wu","template_5mebi5m",{
        title: "Titulo",
        name: "Edgar",
        message: "Mensagem",
        email: "edgar.bispo@aldeiadocafe.com.br",
        },
      'fhQYQ-Ntr84l_55IR')        
      .then(
        (result) => {
          console.log(result.text);
          message.success('Email sent successfully!');
          form.resetFields(); // Clear form on success
        },
        (error) => {
          console.log(error);
          message.error('Failed to send email, please try again.');
        }
      );
      
  };

  return (
    <Card style={{ maxWidth: 400, margin: '50px auto' }} title="Contact Us">
      <Form
        form={form}
        layout="vertical"
        ref={formRef}
        onFinish={sendEmail}
      >
        <Form.Item
          name="user_name"
          label="Name"
          rules={[{ required: true, message: 'Please enter your name' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Your Name" name="user_name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
        >
          <Input prefix={<MailOutlined />} placeholder="Your Email" name="user_email" />
        </Form.Item>

        <Form.Item
          name="link"
          label="Message"
          rules={[{ required: true, message: 'Please enter your message' }]}
        >
          <Input.TextArea placeholder="Your Message" name="message" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<MessageOutlined />}>
            Send Email
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Email;
