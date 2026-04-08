import React from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  DashboardOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const Teste = () => {
  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      style={{
        height: '100vh',
        position: 'fixed',
        left: 0,
      }}
    >
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        {/* Parte Superior: Logo e Menu */}
        <div>
          <div className="logo" style={{ height: 32, margin: 16, background: 'rgba(255,255,255,.2)' }} />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['1']}
            items={[
              { key: '1', icon: <DashboardOutlined />, label: 'Dashboard' },
              { key: '2', icon: <UserOutlined />, label: 'Perfil' },
            ]}
          />
        </div>

        {/* Rodapé: Botão Logout */}
        <div style={{ padding: '16px' }}>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            style={{ color: 'white', width: '100%', textAlign: 'left' }}
            onClick={() => console.log('Log out')}
          >
            Sair
          </Button>
        </div>
      </div>
    </Sider>
  );
};

export default Teste;
