import { Button, Card, Col, Form, Modal, Row, Select, Spin, Tree, message } from "antd"

import Title from 'antd/es/typography/Title';
import { useEffect, useState } from "react";
import { useAuth } from "../Login/AuthContext";
import { getAllUsers, updateUser } from "../../services/UserService";


const PermissionsComponent = () => {

    const { user } = useAuth();

    const [form]    = Form.useForm();
    const { Item }  = Form;

    const [loading,             setLoading]             = useState(true)
    const [desabilitarDuplicar, setDesabilitarDuplicar] = useState(true)
    const [desabilitarAcesso,   setDesabilitarAcesso]   = useState(true)

    const [usersCompany,    setUsersCompany]    = useState([])   
    const [userPrincipal,   setUserPrincipal]   = useState(null)
    const [userDuplicar,    setUserDuplicar]    = useState(null)
    const [optUsuarios,     setOptUsuarios]     = useState([])
    const [optDuplicar,     setOptDuplicar]     = useState([])

    const [expandedKeys, setExpandedKeysPrincipal] = useState(['ALL']);
    const [checkedKeys,  setCheckedKeys]  = useState([]);

    const [modalGravar,     setModalGravar]     = useState(false)
    const [modalDuplicar,   setModalDuplicar]   = useState(false)

    const treeDados = [
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
                        { title: 'Atualizar Estoque', key: 'STOCKGCOM' },
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

    // Dispara ao expandir ou recolher um nó
    const onExpand = (expandedKeysValue) => {
        setExpandedKeysPrincipal(expandedKeysValue);
//        setAutoExpandParent(false);
    };

    const cbUsuarioOnChange = (usuarioID) => {

        setUserPrincipal(null)
        setUserDuplicar(null)
        setOptDuplicar([])
        form.setFieldsValue({cbUsuarioDuplicar: null})

        setDesabilitarAcesso  (usuarioID ? false : true)
        setDesabilitarDuplicar(usuarioID ? false : true)
        setCheckedKeys([])

        if (usuarioID) {


            const userAux = usersCompany.find(usuario => usuario._id === usuarioID)

            if (userAux) {

                setUserPrincipal(userAux)
                setCheckedKeys(userAux.permissions)     
                
                const optAux = usersCompany.filter(usuario => usuario._id != usuarioID)
                const formatarDuplicar = optAux.map(usuario => ({
                    label: usuario.nome,
                    value: usuario._id
                }))
                setOptDuplicar(formatarDuplicar)
                

            }

        }

    }

    const cbDuplicarOnChange = (usuarioID) => {

        if (usuarioID) {

            setModalDuplicar(true)

            const userAux = usersCompany.find(usuario => usuario._id === usuarioID)
            setUserDuplicar(userAux)
            

        }

    }

    const confirmarDuplicar = () => {

        setCheckedKeys(userDuplicar.permissions)
        setModalDuplicar(false)

    }

    const cancelDuplicar = () => {
        setModalDuplicar(false)         
        form.setFieldsValue({cbUsuarioDuplicar: null})        
    }

    const onCheck = (checkedKeysValue) => {

        setCheckedKeys(checkedKeysValue)

    }

    const onClickGravar = () => {

        if (userPrincipal) {
            setModalGravar(true)
        } else {
            message.error('Usuário Principal não selecionado')
        }


    }

    const confirmarGravar = async () => {

        if (userPrincipal) {

            try {

                setLoading(true)

                const usuarioAux = {
                        _id:                userPrincipal._id,
                        email:              userPrincipal.email.toUpperCase(),
                        nome:               userPrincipal.nome.toUpperCase(),
                        senha:              userPrincipal.senha,
                        telefone:           userPrincipal.telefone ? userPrincipal.telefone.replace(/\D/g, '') : "",
                        valeTransporte:     userPrincipal.valeTransporte,
                        valeRefeicao:       userPrincipal.valeRefeicao,
                        visualizarEscalas:  userPrincipal.visualizarEscalas,
                        empresas:           userPrincipal.empresas,
                        situacao:           userPrincipal.situacao,
                        permissions:        checkedKeys,
                        usuarioCriacao:     user ? user._id : null,
                        usuarioAlteracao:   user ? user._id : null,
                    };

                await updateUser(usuarioAux._id, usuarioAux).then((response) => {

                    message.success('Nível de Acesso atualizado com sucesso!')                    
                    form.resetFields(); //Limpa os campos ao fechar                    
                    setUserPrincipal(null)
                    setDesabilitarAcesso  (true)
                    setDesabilitarDuplicar(true)
                    setCheckedKeys([])
                    setModalGravar(false)

                    carregarDados()

                }).catch((error)=> {

                    if (error.response) {
                        message.error(error.response.data || 'Erro no servidor');
                    } else {
                        message.error('Erro ao criar!');
                    }
                });

            } catch (error) {
                console.error(error);
            } finally {

                setLoading(false);

            }            

        } else {

        }

    }

    const carregarDados = async () => {

        setLoading(true);
        
        // Detecta o tipo de conexão (padrão é 5 segundos, mas vira 15 segundos se for 3G/2G)
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const isSlow = connection && (connection.effectiveType === '2g' || connection.effectiveType === '3g');
        const timeoutDuration = isSlow ? 15000 : 3000; 

        try {

            if (user.empresas) {

                const empresasID = user.empresas.map((company) => company._id)

                const [ allUsers, allPermissoes ] = await Promise.all([
                    getAllUsers().then( async response => response.data),
                ])

                const usersCompanyAux = allUsers
                        .filter(usuario => usuario.empresas.length > 0 && 
                                usuario.situacao === 'ATIVO'
                        )
                        .filter(usuario => usuario.empresas.some(emp => empresasID.includes(emp._id)))
                                        
                const formatarUsuarios = usersCompanyAux.map(usuario => ({
                    label: usuario.nome,
                    value: usuario._id
                }))

                setUsersCompany(usersCompanyAux)
                setOptUsuarios(formatarUsuarios)

            }

            // O setTimeout deve envolver APENAS o fechamento do loading
            // para dar tempo do React processar a mudança de estado dos dados
            setTimeout(() => {
              setLoading(false);
            }, timeoutDuration); // Pequeno delay para garantir a renderização


        } catch (error) {
            console.error(error);
        } finally {

            setLoading(false);

        }            

    }

    useEffect(() => {

        carregarDados()

    }, [])

    return (

        <div
        >
            <div style={{ textAlign: 'center' }}>
                <Title level={2}
                    style={{ color: 'var(--primary-color)'}}
                >Níveis de Acesso</Title>
            </div>

            <Spin
                spinning={loading} 
                size='large' 
                description="Carregando..."
    //            fullscreen
                >

                <Form
                    form={form}
    //                        layout="vertical"
                    >


                    <Card
                        size='small'
                        style={{
                            marginBottom: '10px',
                            borderColor: '#c36434',
                            boxShadow: '0 2px 8px #d4b8ab',
                            borderRadius: 8,                    
                        }}
                    >

                            
                        <Row gutter={[16, 16]}>

                            <Col span={14}>

                                <Item
                                    name="cbUsuarioPrincipal"
                                    label="Usuário Principal"
                                >
                                    <Select
                                        showSearch
                                        allowClear
                                        loading={loading}
                                        placeholder="Informe o Usuário"
                                        optionFilterProp="label"
                                        options={optUsuarios}
                                        onChange={cbUsuarioOnChange}
                                    >

                                    </Select>
                                </Item>

                            </Col>

                            <Col 
                                style={{ display: 'flex', justifyContent: 'flex-end' }}>

                                <Button 
                                    type="primary" 
                                    onClick={onClickGravar}
                                >
                                    Gravar
                                </Button>
                            </Col>

                        </Row>

                        <Row gutter={[16, 16]}>

                            <Col span={14}>
                                <Item
                                    name="cbUsuarioDuplicar"
                                    label="Duplicar Acesso"
                                >
                                    <Select
                                        showSearch
                                        allowClear
                                        loading={loading}
                                        disabled = {desabilitarDuplicar}
                                        placeholder="Informe o Usuário"
                                        optionFilterProp="label"
                                        options={optDuplicar}
                                        onChange={cbDuplicarOnChange}
                                    >

                                    </Select>
                                </Item>
                            </Col>

                        </Row>

                    </Card>

                    <Card
                        size='small'
                        style={{
                            borderColor: '#c36434',
                            boxShadow: '0 2px 8px #d4b8ab',
                            borderRadius: 8,                    
//                            width: '100vw',
//                            height: 'calc(66vh - 5px)',
//                            borderRadius: 0, // Remove bordas arredondadas para encaixar na tela
                        }}
                        
                        styles={{
                            body: {                            
                            height: 'calc(66vh - 10px)', // Ajusta a área interna descontando o cabeçalho
                            overflowY: 'auto', // Adiciona barra de rolagem se o conteúdo passar da tela
//                            overflow: 'hidden'
                            },
                        }}                        
                            
                    >

                        <Item
                            name={"treePermissao"}
                        >

                            <Tree
                                checkable
                                disabled={desabilitarAcesso}
                                //defaultExpandAll={true}
                                expandedKeys={expandedKeys}
                                checkedKeys={checkedKeys}
                                onCheck={onCheck}
                                treeData={treeDados}
                                onExpand={onExpand}

                                //autoExpandParent={true}
                            />

                        </Item>

                    </Card>

                </Form>

                {/* 5. Modal de Confirmação do Ant Design */}
                <Modal
                    title="Confirmar Nível de Acesso"
                    open={modalGravar}
                    onOk={confirmarGravar}
                    onCancel={() => setModalGravar(false)}
                    okText="OK"
                    cancelText="Cancelar"
                    //              okButtonProps={{ danger: true }} // Deixa o botão de confirmação vermelho
                >
                    <p>Tem certeza que deseja gravar <strong>Nível de Acesso</strong>?</p>
                    <p>Esta ação não poderá ser desfeita.</p>

                </Modal>

                {/* 5. Modal de Confirmação do Ant Design */}
                <Modal
                    title="Duplicar Nível de Acesso"
                    open={modalDuplicar}
                    onOk={confirmarDuplicar}
                    onCancel={cancelDuplicar}
                    okText="OK"
                    cancelText="Cancelar"
                    //              okButtonProps={{ danger: true }} // Deixa o botão de confirmação vermelho
                >
                    <p>Tem certeza que deseja duplicar Nível de Acesso do <strong>{userDuplicar?.nome}</strong> para <strong>{userPrincipal?.nome}</strong>?</p>

                </Modal>

            </Spin>

        </div>
    )

}

export default PermissionsComponent