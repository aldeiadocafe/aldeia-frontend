import React, { useState } from 'react';
import { Content } from 'antd/es/layout/layout';
import { Avatar, Button, Grid, Layout } from 'antd';
import Sider from 'antd/es/layout/Sider';


import Logo from './Logo';
import MenuList from './MenuList';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogoutOutlined, SettingOutlined, UpOutlined, UserOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';

import { useAuth } from '../Login/AuthContext';

const { useBreakpoint } = Grid

const MainLayout = () => {

    const { logout } = useAuth()

    const navigator = useNavigate()

    const [collapsed, setCollapsed] = useState(true);

    const { user } = useAuth();
    
    const screens = useBreakpoint()

  // XS < 576px; SM >= 576PX; MD >= 768px; LG >= 992px; XL >= 1200px; XXL >= 1600px
    const customHeight = screens.xl ? '100vh' : 'calc(100vh - 100px)'

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

    // 2. Função de callback para lidar com cliques nos itens
    const onClick = ({ key }) => {
/*
        console.log(`Clicou no item com a chave: ${key}`);
        alert(`Você selecionou o item ${key}`);
*/

        if (key === '1')
            navigator('/profiles') 

        if (key === '3')
            handleLogout()

    };


    const handleLogout = async () => {

        console.log('Logout realizado!');

        logout()
/*
        localStorage.removeItem('auth-token');
        sessionStorage.removeItem('auth-token');

        localStorage.removeItem('auth-user');
        sessionStorage.removeItem('auth-user');        
*/
        window.location.href = '/login';

    };

    return (
        <Layout style={{height: customHeight}}>
            <Sider 
                collapsedWidth='40px'
                collapsed={collapsed} 
//                collapsible
                trigger={null}
                onMouseLeave={() => setCollapsed(true)}
                onMouseEnter={() => setCollapsed(false)}
                style={{ 
                    background: 'var(--primary-color)' /* Sua cor personalizada */ }}
                >

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: customHeight,
                    }}
                >
                    <a href='/'>
                        <div className='sider-logo'>          
                            <Button
                                type='text'
                                className='toogle'
                                onClick={() => setCollapsed(!collapsed)}
                                >
                                <Logo/>
                            </Button>
                        </div>
                    </a>

                    <MenuList/>

                    {/* Botão Logout no Rodapé da Sidebar  */}
                    <div style={{ padding: '8px', 
                                  marginTop: 'auto',
                                  color: 'white',}}>

                        <Dropdown
                            menu={{
                                items,
                                onClick,
                            }}
                        // O trigger padrão é 'hover', mas você pode mudar para ['click']
                        //      trigger={['click']} 
                        >
                            <Space>
                                <Avatar shape="square" 
                                    size="small" 
                                    icon={<UserOutlined />} />            
                                {!collapsed && user ? user.nome : ''}
                            </Space>
                        </Dropdown>
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