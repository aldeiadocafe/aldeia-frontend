import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Space, Avatar } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';

const Teste = () => {

    // 1. Defina os itens do menu como um objeto de configuração
    const items = [
        {
            key: '1',
            label: 'Perfil',
            icon: <SettingOutlined />,
        },
        {
            type: 'divider',
        },
        {
            key: '3',
            label: 'Logout',
            icon: <LogoutOutlined />,
            danger: true,
        },
    ];

  const [collapsed, setCollapsed] = useState(true);


  return (
    <Layout style={{height: '100vh'}}>

      <Sider
        collapsedWidth='40px'
        collapsed={collapsed} 
//        collapsible
        trigger={null}
        onMouseLeave={() => setCollapsed(true)}
        onMouseEnter={() => setCollapsed(false)}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          background: 'var(--primary-color)'
        }}
      >      

        <div 
          style={{ display: 'flex', 
                   flexDirection: 'column', 
                  height: 'calc(100vh - 93px)',
                  }}
                  >

          {/* Botão Logout no Rodapé da Sidebar  */}
          <div style={{ padding: '8px', 
                        marginTop: 'auto',
                        color: 'white',}}>

              <Dropdown
                  menu={{
                      items
                  }}
              // O trigger padrão é 'hover', mas você pode mudar para ['click']
              //      trigger={['click']} 
              >
                  <Space>
                      <Avatar shape="square" 
                          size="small" 
                          icon={<UserOutlined />} />            
                      Teste
                  </Space>
              </Dropdown>
          </div>
        </div>        

      </Sider>

    </Layout>
  );
};

export default Teste;
