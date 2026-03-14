import React, { useState } from 'react';
import { Content } from 'antd/es/layout/layout';
import { Button, Layout } from 'antd';
import Sider from 'antd/es/layout/Sider';


import Logo from './Logo';
import MenuList from './MenuList';
import { Outlet } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';

const MainLayout = () => {

    const [collapsed, setCollapsed] = useState(true);

    const handleLogout = () => {
        console.log('Logout realizado!');
        localStorage.removeItem('auth-token');
        window.location.href = '/login';
    };

    return (
        <Layout className="full-height-layout">
            <Sider 
                width={220}
                collapsedWidth='40px'
                collapsed={collapsed} 
                collapsible
                trigger={null}
                onMouseLeave={() => setCollapsed(true)}
                onMouseEnter={() => setCollapsed(false)}
                style={{ background: 'var(--primary-color)' /* Sua cor personalizada */ }}
                >

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                    }}
                >
                    <div className='sider-logo'>          
                    <Button
                        type='text'
                        className='toogle'
                        onClick={() => setCollapsed(!collapsed)}
                        >
                        <Logo/>
                        </Button>
                    </div>

                    <MenuList/>

                    {/* Botão Logout no Rodapé da Sidebar */}
                    <div style={{ padding: '11px', marginTop: 'auto' }}>
                        <Button
                        type="text"
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        style={{ 
                            color: 'white', 
                            width: '100%', 
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'flex-start'
                        }}
                        >
                            {!collapsed && 'Logout'}
                        </Button>
                    </div>

                </div>

            </Sider>

            <Content
                style={{
                    padding: '10px',
                    height: '100vh',
                    }}
                >

                {/* O Outlet renderiza o componente da rota ativa */}
                <Outlet />

            </Content>
        </Layout>
    );
};

export default MainLayout;