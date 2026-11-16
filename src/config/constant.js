export const API_BASE_URL = import.meta.env.MODE == "development" ? 'http://localhost:5000/api/v1/' : 'https://aldeia-backend.vercel.app/api/v1/';
//export const API_BASE_URL = 'https://aldeia-backend.vercel.app/api/v1/';
export const API_URL = import.meta.env.MODE == "development" ? 'https://192.168.68.111:5173/' : 'https://app.aldeiadocafe.com.br'
export const TAMANHO_PAGINA = 10;
export const ALDEIA_CNPJ=58694360000110

export const opcoesMenu = [
        {
            title: 'Total',
            key: 'ALL',
            children: [
                {
                    title:  'Estoque',
                    key:    'MNUSTOCK',
                    children: [
                        { 
                            title:    'Cadastro', 
                            key:      'STOCKMAINTENANCE',
                            children: [
                                { title: 'Unid Medida',     key: 'STOCKUNIT'        },
                                { title: 'Item',            key: 'STOCKITEM'        },
                                { title: 'Est Segurança',   key: 'STOCKSAFETYSTOCK' },
                            ]
                        },
                        { 
                            title:    'Consulta', 
                            key:      'STOCKQUERY',
                            children: [
                                { title: 'Saldo Item',      key: 'STOCKSTOCKBALANCE'        },
                                { title: 'Data Validade',   key: 'STOCKDATESITEMSBALANCE'   },
                                { title: 'Itens Críticos',  key: 'STOCKCRITICALITEMS'       },
                            ]
                        },
                    ],
                },
                {
                    title:  'Inventário',
                    key:    'MNUINVENTORY',
                    children: [
                        { title: 'Inventário',  key: 'INVENTORYINVENTORY'   },
                        { title: 'Conferência', key: 'INVENTORYCONFERENCE'  },
                    ],
                },
                {
                    title:  'Compras',
                    key:    'MNUPURCHASE',
                    children: [
                        { title: 'Lista de Compras', key: 'PURCHASESHOPPING' },
                    ],
                },
                {
                    title:  'Escala',
                    key:    'MNUSCHEDULE',
                    children: [
                        { title: 'Ativa', key: 'SCHEDULEACTIVESCHEDULE'},
                        { 
                            title:    'Cadastro', 
                            key:      'SCHEDULEMAINTENANCE',
                            children: [
                                { title: 'Tipo Evento',     key: 'SCHEDULEVENTTYPE'     },
                                { title: 'Nova Escala',     key: 'SCHEDULENEWSCHEDULE'  },
                            ]
                        },
                        { 
                            title:    'Consulta', 
                            key:      'SCHEDULEQUERY',
                            children: [
                                { title: 'Versões',     key: 'SCHEDULEVERSIONS'        },
                                { title: 'Desp Diária', key: 'SCHEDULEDAILYEXPENSES'   },
                            ]
                        },
                    ],
                },
                {
                    title:  'GCom',
                    key:    'MNUGCOM',
                    children: [
                        { title: 'Estoque Atual', key: 'GCOMSTOCK' },
                        { title: 'Estoque Em...', key: 'GCOMSTOCKIN' },
                    ],
                },
                {
                    title:  'Configuração',
                    key:    'MNUSYSTEM',
                    children: [
                        { title: 'Empresa',             key: 'SYSTEMCOMPANY'    },
                        { title: 'Usuário',             key: 'SYSTEMUSER'       },
                        { title: 'Níveis de Acesso',    key: 'SYSTEMPERMISSION' },
                    ],
                },
            ]
        },
    ];