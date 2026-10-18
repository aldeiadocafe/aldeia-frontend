import { useEffect, useState } from 'react';
import { AlertOutlined, AppstoreAddOutlined, AppstoreOutlined, BookOutlined, CalculatorOutlined, FunnelPlotOutlined, HistoryOutlined, HomeOutlined, LogoutOutlined, SafetyOutlined, ScheduleOutlined, SettingOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons';

import { Menu, ConfigProvider, Grid } from 'antd';
import { Link } from 'react-router-dom';
import { BiBox, BiBuilding, BiUnite } from 'react-icons/bi';
import { BsBoxSeam, BsCashStack, BsCart2, BsListTask, BsCalendar2Range, BsCalendar3 } from 'react-icons/bs';
import { useAuth } from '../Login/AuthContext';

const { useBreakpoint } = Grid

const allMenuItems = [
    { 
        key: 'MNUSTOCK',
        icon: <AppstoreOutlined />,
        label: "Estoque",
        children: [
            {
                key:'STOCKMAINTENANCE',
                label: 'Cadastro',
                children: [
                    {
                        key: 'STOCKUNIT',
//                            icon: <FunnelPlotOutlined />,
                        icon: <BiUnite/>,
                        label: 
                            <Link to="/units">
                                Unid Medida
                            </Link>,

                    },
                    {
                        key: 'STOCKITEM',
                        icon: <AppstoreAddOutlined />,
                        label: 
                            <Link to="/items">
                                Item
                            </Link>,
                    },
                    {
                        key: 'STOCKSAFETYSTOCK',
                        icon: <SafetyOutlined />,
                        label: 
                            <Link to="/safetystocks">
                                Est Segurança
                            </Link>,
                    },
/*                        
                    {
                        key: 'fatorConversao',
                        icon: <BsArrowLeftRight />,
                        label: 
                            <Link to="/conversationsitem">
                                Fator Conv
                            </Link>,
                    },
*/                        
                ]
            },
            {
                key: 'STOCKQUERY',
                label: 'Consulta',
                children: [
                    {
                        key: 'STOCKSTOCKBALANCE',
//                            icon: <FunnelPlotOutlined />,
                        icon: <BiBox/>,
                        label: 
                            <Link to="/stockbalance">
                                Saldo Item
                            </Link>,

                    },
                    {
                        key: 'STOCKDATESITEMSBALANCE',
                        icon: <FunnelPlotOutlined />,
                        label: 
                            <Link to="/datesitemsbalance">
                                Data Validade
                            </Link>,

                    },
                    {
                        key: 'STOCKCRITICALITEMS',
                        icon: <AlertOutlined />,
                        label: 
                            <Link to="/criticalitems">
                                Itens Críticos
                            </Link>,

                    },
                ]
            },
        ] 
    },
    { 
        key: 'MNUINVENTORY',
        icon: <ScheduleOutlined />,
        label: "Inventário",
        children: [
            {
                key: 'INVENTORYINVENTORY',
                icon: <HistoryOutlined />,
                label: 
                    <Link to="/inventorys">
                        Inventário
                    </Link>,

            },          
/*                      
            {
                key: 'placesInventory',
                icon: <BookOutlined />,
                label: 
                    <Link to="/placesinventory">
                        Local
                    </Link>,

            },                                
*/                
            {
                key: 'INVENTORYCONFERENCE',
                icon: <CalculatorOutlined />,
                label: 
                    <Link to="/conferences">
                        Conferência
                    </Link>,

            },
        ]
    },
    { 
        key: 'MNUPURCHASE',
        icon: <BsCart2 />,
        label: "Compras",
        children: [
            {
                key: 'PURCHASESHOPPING',
                icon: <BsListTask />,
                label: 
                    <Link to="/shopping">
                        Lista de Compras
                    </Link>,

            },                
        ]
    },        
    { 
        key: 'MNUSCHEDULE',
        icon: <BsCalendar3 />,
        label: "Escala",            
        children: [
            {
                key: 'SCHEDULEACTIVESCHEDULE',
                icon: <BsCalendar2Range />,
                label: 
                    <Link to="/activeSchedule">
                        Ativa
                    </Link>,
            },  
            {
                key:'SCHEDULEMAINTENANCE',
                label: 'Cadastro',
                children: [
                    {
                        key: 'SCHEDULEVENTTYPE',
//                            icon: <FunnelPlotOutlined />,
                        icon: <BookOutlined />,
                        label: 
                            <Link to="/typeEvents">
                                Tipo Evento
                            </Link>,

                    },
                    {
                        key: 'SCHEDULENEWSCHEDULE',
//                            icon: <FunnelPlotOutlined />,
                        icon: <ScheduleOutlined />,
                        label: 
                            <Link to="/draftSchedules">
                                Nova Escala
                            </Link>,

                    },
                ]
            },
            {
                key:'SCHEDULEQUERY',
                label: 'Consulta',
                children: [
                    {
                        key: 'SCHEDULEVERSIONS',
//                            icon: <FunnelPlotOutlined />,
                        icon: <HistoryOutlined />,
                        label: 
                            <Link to="/versionsSchedule">
                                Versões
                            </Link>,

                    },
                ]
            }

        ]

    },
    { 
        key: 'MNUGCOM',
        icon: <BsCashStack/>,
        label: "GCom",
        children: [
            {
                key: 'STOCKGCOM',
                icon: <BsBoxSeam/>,
                label: 
                    <Link to="/stockgcom">
                        Atualizar Estoque
                    </Link>,

            },
        ]
    },
/*        
    { 
        key: 'mnuReceipt',
        icon: <BiBox />,
        label: "Recebimento",
        children: [
            {
                key: 'mnuImportarNFe',
                icon: <BsReceiptCutoff />,
                label: 
                    <Link to="/importarnfe">
                        Importar NFe
                    </Link>,
            },
        ]
    },
// XS < 576px; SM >= 576PX; MD >= 768px; LG >= 992px; XL >= 1200px; XXL >= 1600px
*/        
    // Este item só aparece em telas grandes (lg ou superior)
//        screens.xs &&
    { 
        key: 'MNUSYSTEM',
        icon: <SettingOutlined />,
        label: "Configuração",
        children: [
            {
                key: 'SYSTEMCOMPANY',
                icon: <BiBuilding/>,
                label: 
                    <Link to="/companys">
                        Empresa
                    </Link>,

            },
            {
                key: 'SYSTEMUSER',
                icon: <UserOutlined />,
                label:
                    <Link to="/users">
                        Usuário
                    </Link>,
            }
        ]
    },
];

// 3. Função recursiva para filtrar os itens com base nas permissões
const filterMenuItems = (items, permissions) => {

  return items
    .filter(item => !item.key 
                || permissions.includes("ALL")  //Habilita todos os menus
                || permissions.includes(item.key.toUpperCase()))
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

const MenuList = () => {

    const { user } = useAuth();

    const [current, setCurrent] = useState('1');

    const screens = useBreakpoint()

    // 4. Filtrando a lista antes de renderizar
    const [allowedItems, setAllowedItems] = useState([])

    const onClick = (e) => {
        setCurrent(e.key);
    }

    useEffect(() => {
        setAllowedItems(filterMenuItems(allMenuItems, user.permissions))
    },[user]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            // Cor do texto para itens de menu padrão
            itemColor: '#464545ff', // Exemplo: Verde
            // Cor do texto para o item de menu selecionado
            itemSelectedColor: 'var(--error-color)', // Exemplo: Vermelho
            // Cor de fundo do item selecionado, se necessário
            // itemSelectedBg: '#f0f0f0',
          },
        },
      }}
    >
        <Menu 
            theme="light" 
            mode='inline' 
            className='menu-bar'
//            items={allMenuItems}
            items={allowedItems} // Passa apenas os itens permitidos
            onClick={onClick}
            selectedKeys={[current]}
            >
        </Menu>
        
    </ConfigProvider>
  )
}

export default MenuList