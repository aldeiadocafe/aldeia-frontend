import React from 'react';
import { Form, Input, Button, Row, Col } from 'antd';

const Teste = () => {
  return (
    <Form
      layout="inline"
      style={{ width: '100%', display: 'flex' }}
    >
      <Form.Item style={{ flex: 1, marginRight: 0 }}>
        <Input placeholder="Campo 1 - Ocupa espaço" />
      </Form.Item>
      <Form.Item style={{ flex: 1, marginRight: 0 }}>
        <Input placeholder="Campo 2 - Ocupa espaço" />
      </Form.Item>
      <Form.Item>
        <Button type="primary">Enviar</Button>
      </Form.Item>
    </Form>
  );
};

export default Teste;
