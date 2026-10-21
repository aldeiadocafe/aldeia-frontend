import React from 'react';
import { Menu } from 'antd';
import { HomeOutlined, SettingOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';

// 1. Simulação das permissões do usuário logado
const userPermissions = ['view_home', 'view_profile', 'manage_settings']; 
// Nota: O usuário não tem a permissão 'view_reports'

// 2. Definição de TODOS os itens do menu com uma propriedade extra 'permission'
const allMenuItems = [
  {
    key: 'home',
    label: 'Home',
    icon: <HomeOutlined />,
    permission: 'view_home',
  },
  {
    key: 'profile',
    label: 'Perfil',
    icon: <UserOutlined />,
    permission: 'view_profile',
  },
  {
    key: 'reports',
    label: 'Relatórios Avançados',
    icon: <FileTextOutlined />,
    permission: 'view_reports', // Este item será ocultado
  },
  {
    key: 'settings',
    label: 'Configurações',
    icon: <SettingOutlined />,
    permission: 'manage_settings',
    // Exemplo de submenus (children)
    children: [
      {
        key: 'general-settings',
        label: 'Gerais',
        permission: 'manage_settings',
      },
      {
        key: 'admin-settings',
        label: 'Adminpenas',
        permission: 'super_admin', // Também será ocultado
      },
    ],
  },
];

// 3. Função recursiva para filtrar os itens com base nas permissões
const filterMenuItems = (items, permissions) => {
  return items
    .filter(item => !item.permission || permissions.includes(item.permission))
    .map(item => {
      if (item.children) {
        return {
          ...item,
          children: filterMenuItems(item.children, permissions), // Filtra submenus
        };
      }
      return item;
    })
    // Remove itens pai que ficaram com a lista de filhos vazia após o filtro (opcional)
    .filter(item => !item.children || item.children.length > 0);
};

const Teste = () => {

  // 4. Filtrando a lista antes de renderizar
  const allowedItems = filterMenuItems(allMenuItems, userPermissions);

  return (
    <Menu
      mode="inline"
      theme="dark"
      style={{ width: 256 }}
      items={allowedItems} // Passa apenas os itens permitidos
    />
  );
};

export default Teste;
