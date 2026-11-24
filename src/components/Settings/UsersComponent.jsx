import { useEffect, useState } from 'react'
import { AppstoreAddOutlined, CheckOutlined, CheckSquareOutlined, DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined, EyeTwoTone, FileSearchOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Input, Button, Space, Modal, Form, message, Tooltip, Popconfirm, Spin, Select, Row, Col, InputNumber, Checkbox} from 'antd'
import { PatternFormat } from 'react-number-format'; // Recomendado: PatternFormat para máscaras fixas
import { cpf, cnpj } from 'cpf-cnpj-validator';

import Title from 'antd/es/typography/Title';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { createUser, deleteUser, getAllUsers, updateUser } from '../../services/UserService';
import { getAllCompanys } from '../../services/CompanyService';
import { useAuth } from '../Login/AuthContext';
import { normalizarTexto } from '../../Funcoes/Utils';

dayjs.extend(utc)

const UsersComponent = () => {

    const { user } = useAuth();

    const [usuarios, setUsuarios] = useState([])
    const [empresas, setEmpresas] = useState([])
    const [loading,  setLoading]  = useState(false)

    const [valeRefeicao,    setValeRefeicao]    = useState(0)
    const [valeTransporte,  setValeTransporte]  = useState(0)

    const [modalVisible, setModalVisible] = useState(false)
    const [deleteModal,  setDeleteModal]  = useState(false)
    const [editingUser,  setEditingUser]  = useState(null)

    const [searchText,      setSearchText]      = useState('');
    const [SelectedRowKeys, setSelectedRowKeys] = useState();

    const [form] = Form.useForm()
    const { Item }  = Form;

    // Formata o número para o padrão pt-BR (ex: 1.234,56)
    const brazilianFormatter = (num) => {
        if (num === undefined || num === null || num === '') return '';
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            }).format(num);
    };

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 3,
    });

    // Converte a string formatada de volta para número limpo (float)
    const brazilianParser = (str) => {
        if (!str) return '';
            // Remove tudo que não for dígito, vírgula ou sinal de menos
            const cleaned = str.replace(/[^\d,-]/g, '').replace(',', '.');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? '' : parsed;
    };

    // Exemplo: Limitar para 4 linhas (4 * 32px = 128px)
    const limitHeight = 4 * 32; 

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        // Note: The actual data filtering happens internally via the 'onFilter' prop, 
        // but you can manage a state here if needed for other components.
    };

    const handleReset = (clearFilters, confirm) => {
        clearFilters();
        setSearchText({});
        confirm();
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
        <div style={{ padding: 8 }}>
            <Input
            placeholder={`Procurar ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value.toUpperCase()] : [])}
            onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
            style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
            <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                icon={<FileSearchOutlined />}
                size="small"
                style={{ width: 90 }}
            >
                Procurar
            </Button>
            <Button
                onClick={() => handleReset(clearFilters, confirm)}
                size="small"
                style={{ width: 90 }}
            >
                Limpar
            </Button>
            </Space>
        </div>
        ),
        filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) => 
        normalizarTexto(record[dataIndex].toString().toUpperCase()).includes(normalizarTexto(value.toUpperCase())),
    });

    const colunas = 
    [
        {
            title: 'Ação',
            key: 'action',
            width: 130,
            align: 'center',
            render: (text, record) => (
                <Space size="small">

                    <Tooltip title="Editar">
                        <Button
                            type="primary"
                            shape='circle'
                            className={'rotate-icon'}
                            icon={<EditOutlined rotate={0} />}
                            onClick={() => handleOpenModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Eliminar">                        
                        <Button
                            type="primary"
                            danger
                            shape='circle'
                            className={'rotate-icon'}
                            icon={<DeleteOutlined rotate={0} />}
                            onClick={() => btnEliminar(record)}
                        />
                    </Tooltip>       

                </Space>
            ),
        },        
        {
            title:      "Nome",
            dataIndex:  "nome",
            key:        "nome",
            sorter: (a, b) => a.nome.localeCompare(b.nome),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('nome'),
            ellipsis: true,
        },
        {
            title:      "E-mail",
            dataIndex:  "email",
            key:        "email",
            sorter: (a, b) => a.email.localeCompare(b.email),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('email'),
            ellipsis: true,
        },
        {
            title:      "Telefone",
            dataIndex:  "telefone",
            key:        "telefone",
            sorter: (a, b) => a.telefone.localeCompare(b.telefone),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('telefone'),
            ellipsis: true,
        },
        {
            title:      "Situação",
            dataIndex:  "situacao",
            key:        "situacao",
            sorter: (a, b) => a.situacao.localeCompare(b.situacao),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('situacao'),
            ellipsis: true,
        },
        {
            dataIndex:  "valeTransporte",
            title:      "Vale Transporte",
            align: 'right',
            render: (value) => formatter.format(value)
        },
        {
            dataIndex:  "valeRefeicao",
            title:      "Vale Refeição",
            align: 'right',
            render: (value) => formatter.format(value)
        },
        
    ]

    const btnEliminar = (value) => {

        setEditingUser(false)
        setDeleteModal(true);

        if(value) {

            form.setFieldsValue({
                _id:                value._id,
                email:              value.email.toUpperCase(),
                nome:               value.nome.toUpperCase(),
                senha:              value.senha,
                telefone:           value.telefone,
                situacao:           value.situacao,
                valeTransporte:     value.valeTransporte,
                valeRefeicao:       value.valeRefeicao,
                visualizarEscalas:  value.visualizarEscalas,
                empresas:           value.empresas
                                    ? value.empresas.map(empresa => empresa._id)
                                    : null
            })
        }
    }

    const handleOpenModal = (record = null) => {

        setEditingUser(record)
        if (record) {
            //Preenche o formulário com os dados
            form.setFieldsValue({
                _id:                record._id,
                email:              record.email.toUpperCase(),
                nome:               record.nome.toUpperCase(),
                senha:              record.senha,
                telefone:           record.telefone,
                situacao:           record.situacao,
                valeTransporte:     record.valeTransporte,
                valeRefeicao:       record.valeRefeicao,
                visualizarEscalas:  record.visualizarEscalas,
                empresas:           record.empresas
                                    ? record.empresas.map(empresa => empresa._id)
                                    : null
            })

        } else {
            //Limpa o formulario
            form.resetFields()
        }

        setModalVisible(true)
    }

    //Salvar
    const handleSave = async (values) => {

        const usuarioAnt = usuarios.find(item => item._id === values._id)
        let senhaAux
        let usuario

        if (usuarioAnt) {

            
            if (usuarioAnt.senha === values.senha) senhaAux = values.senha

        }

        if (senhaAux) {

            usuario = {
                _id:                values._id,
                email:              values.email.toUpperCase(),
                nome:               values.nome.toUpperCase(),
                telefone:           values.telefone ? values.telefone.replace(/\D/g, '') : "",
                valeTransporte:     values.valeTransporte,
                valeRefeicao:       values.valeRefeicao,
                visualizarEscalas:  values.visualizarEscalas,
                empresas:           values.empresas,
                situacao:           values.situacao,
                usuarioCriacao:     user ? user._id : null,
                usuarioAlteracao:   user ? user._id : null,
            };

        } else {

            usuario = {
                _id:                values._id,
                email:              values.email.toUpperCase(),
                nome:               values.nome.toUpperCase(),
                senha:              values.senha,
                telefone:           values.telefone ? values.telefone.replace(/\D/g, '') : "",
                valeTransporte:     values.valeTransporte,
                valeRefeicao:       values.valeRefeicao,
                visualizarEscalas:  values.visualizarEscalas,
                empresas:           values.empresas,
                situacao:           values.situacao,
                usuarioCriacao:     user ? user._id : null,
                usuarioAlteracao:   user ? user._id : null,
            };

        }

        try {
            if (editingUser) {

                await updateUser(values._id, usuario)
                message.success('Registro atualizado com sucesso!')

            } else {

                await createUser(usuario)
                message.success('Registro criado com sucesso!')

            }
            setModalVisible(false)
            carregarDados()

        } catch (error) {
            message.error('Erro ao salvar usuário')
            console.error(error)
        }
    }

    const handleDelete = async () => {

        const userID = form.getFieldValue('_id')
        if (userID) {

            try {
                await deleteUser(userID)
                message.success('Registro eliminado com sucesso!')
                setDeleteModal(false)
                carregarDados()
            } catch (error) {
                message.error('Erro ao excluir usuário')
                console.error(error)
            }

        }
    }

    const carregarDados = async () => {

        setLoading(true)
        try {

            const [resUsuarios, resEmpresas] = await Promise.all([
                getAllUsers(),
                getAllCompanys()
            ])

            setUsuarios(resUsuarios.data)
            setEmpresas(resEmpresas.data)

        } catch (error) {
//            message.error('Erro ao carregar dados do servidor.');
            console.error(error);
        } finally {

            setSelectedRowKeys([]);
            setLoading(false);

        }
    }

    useEffect(() => {
        carregarDados()
    },[]);

  return (
    <div>

        <div style={{ textAlign: 'center' }}>
            <Title level={2}
                style={{ color: 'var(--primary-color)'}}
            >Usuário</Title>
        </div>

        <Spin 
            spinning={loading} 
            size='large' 
            description="Carregando..."
//            fullscreen
            >

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                    type='primary'
                    icon={<AppstoreAddOutlined />}
                    onClick={() => handleOpenModal()}
                    >
                        Cadastrar
                </Button>
                <br></br>
                <br></br>
            </div>

            <Table
                columns={colunas}
                dataSource={usuarios}      
                showSorterTooltip={true}
                size={'small'}
                scroll={{ y: 'calc(80vh - 90px)' }}                
                rowKey={(record) => record._id}
                pagination={false}
                loading={false}
            />

            {/* Modal de Form */}
            <Modal
                title={ "Manutenção Cadastro Usuário"}
                width={"100vw"}
                style={{ top: 20, padding: 0, margin: 15 }}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}        
                onOk={() => form.submit()} // Dispara o onFinish do Form
            >        
                <Form
                    form={form}
                    layout='vertical'
                    onFinish={handleSave}
                    initialValues={{
                        situacao: 'ATIVO',
                        visualizarEscalas: false
                    }}
                    >
                    <Item
                        name={"_id"}
                        style={{ display: 'none'}}
                    >
                        <Input />
                    </Item>

                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Item
                                name={"nome"}
                                label="Nome"
                                rules={[{required: true, message: 'Informar Nome'}]}
                                >
                                <Input 
                                    style={{ textTransform: 'uppercase' }}
//                                    disabled={!editingUser || idUser}
                                    />
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                name={"email"}
                                label="E-mail"
                                rules={[
                                    {required: true, message: 'Informar E-mail'},
                                    {type: 'email',  message: 'O e-mail inserido não é válido!'}
                                ]}
                                >
                                <Input 
                                    style={{ textTransform: 'uppercase' }}
                                    placeholder="seu.email@exemplo.com"
                                    />
                            </Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Item
                                name={"senha"}
                                label="Senha"
                                rules={[{required: true, message: 'Informar Senha'}]}
                                >
                                <Input.Password
                                    allowClear
                                    placeholder="Informar Senha"
                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                />            
                            </Item>
                        </Col>
                        <Col span={6}>
                            <Item
                                name={"telefone"}
                                label="Telefone"
                                >
                                {/* Componente de Máscara integrado ao Input do Antd */}
                                <PatternFormat
                                    customInput={Input} // Usa o estilo do Ant Design
                                    format="(##) #####-####"   // A- Letra, # Numero
                                    mask="_"
                                    placeholder="(00) 00000-0000"
                                />            
                            </Item>
                        </Col>
                        <Col span={6}>
                            <Item
                                name={"situacao"}
                                label="Situação"
                                rules={[{required: true, message: 'Selecionar Situação'}]}
                                >
                                <Select
                                    placeholder="Selecionar uma situação"
                                    allowClear  //Permite limpar seleção
                                >
                                    <Option value="ATIVO">ATIVO</Option>
                                    <Option value="OBSOLETO">OBSOLETO</Option>
                                </Select>
                            </Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col>
                            <Item
                                name="valeRefeicao"
                                label="Vale Refeição"
                            >
                                <InputNumber
                                    prefix="R$"
                                    style={{ width: '100%' }}
                                    step={0.01}                                    
                                    value={valeRefeicao}
                                    formatter={brazilianFormatter}
                                    parser={brazilianParser}
                                    onChange={(val) => setValeRefeicao(val)}
                                />
                            </Item>
                        </Col>
                        <Col>
                            <Item
                                name="valeTransporte"
                                label="Vale Transporte"
                            >
                                <InputNumber
                                    prefix="R$"
                                    style={{ width: '100%' }}
                                    step={0.01}                                    
                                    value={valeTransporte}
                                    formatter={brazilianFormatter}
                                    parser={brazilianParser}
                                    onChange={(val) => setValeTransporte(val)}
                                />
                            </Item>
                        </Col>
                        <Col>
                            <Item
                                name="visualizarEscalas"                                    
                                valuePropName='checked'
                                label="Escalas"
                            >
                                <Checkbox
                                >
                                    Visualizar Escalas
                                </Checkbox>
                            </Item>
                        </Col>
                                
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col span={18}>
                            <Item
                                name="empresas"
                                label={"Empresas"}
                                rules={[{required: true, 
                                        message: 'Informar Empresa'}]}
                                >
                                <Select
                                    placeholder="Selecionar Empresa"
                                    optionLabelProp='label'
                                    mode="multiple"
                                    allowClear  //Permite limpar seleção

                                    //Mapeia o array de empresas
                                    options={
                                        empresas.map( emp => ({
                                            value: emp._id,
                                            label: emp.nome
                                        }))
                                    }
                                >
                                </Select>
                            </Item>
                        </Col>
                    </Row>
                </Form>

            </Modal>

            <Modal
                title={ "Eliminar Usuário"}
                width={"100vw"}
                style={{ top: 20, padding: 0, margin: 15 }}
                open={deleteModal}
                onCancel={() => setDeleteModal(false)}        

                footer = {[
                    <Button key="cancela" onClick={() => setDeleteModal(false)}>
                        Cancelar
                    </Button>,
                    <Popconfirm
                        key="submit"
                        title="Confirma a exclusão do registro?"
                        description="Ao confirmar o registro será elimando permanentemente."
                        onConfirm={handleDelete}  
                        okText="Sim"
                        cancelText="Não"            
                        placement='topLeft'
                        >
                        <Button type="primary" >
                            OK
                        </Button>
                    </Popconfirm>,
                ]}

            >
                
                <Form
                    form={form}
                    layout='vertical'
                    >
                    <Item
                        name={"_id"}
                        style={{ display: 'none'}}
                    >
                        <Input />
                    </Item>

                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Item
                                name={"email"}
                                label="E-mail"
                                rules={[
                                    {required: true, message: 'Informar E-mail'},
                                    {type: 'email',  message: 'O e-mail inserido não é válido!'}
                                ]}
                                >
                                <Input 
                                    disabled
                                    style={{ textTransform: 'uppercase' }}
                                    placeholder="seu.email@exemplo.com"
                                    />
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                name={"nome"}
                                label="Nome"
                                rules={[{required: true, message: 'Informar Nome'}]}
                                >
                                <Input 
                                    style={{ textTransform: 'uppercase' }}
                                    disabled
                                    />
                            </Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Item
                                name={"senha"}
                                label="Senha"
                                rules={[{required: true, message: 'Informar Senha'}]}
                                >
                                <Input.Password
                                    disabled
                                    placeholder="Informar Senha"
                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                />            
                            </Item>
                        </Col>
                        <Col span={6}>
                            <Item
                                name={"telefone"}
                                label="Telefone"
                                >
                                {/* Componente de Máscara integrado ao Input do Antd */}
                                <PatternFormat
                                    disabled
                                    customInput={Input} // Usa o estilo do Ant Design
                                    format="(##) #####-####"   // A- Letra, # Numero
                                    mask="_"
                                    placeholder="(00) 00000-0000"
                                />            
                            </Item>
                        </Col>
                        <Col span={6}>
                            <Item
                                name={"situacao"}
                                label="Situação"
                                rules={[{required: true, message: 'Selecionar Situação'}]}
                                >
                                <Select
                                    disabled
                                    placeholder="Selecionar uma situação"
                                    allowClear  //Permite limpar seleção
                                >
                                    <Option value="ATIVO">ATIVO</Option>
                                    <Option value="OBSOLETO">OBSOLETO</Option>
                                </Select>
                            </Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col>
                            <Item
                                name="valeRefeicao"
                                label="Vale Refeição"
                            >
                                <InputNumber
                                    prefix="R$"
                                    style={{ width: '100%' }}
                                    step={0.01}                                    
                                    disabled
                                    value={valeRefeicao}
                                    formatter={brazilianFormatter}
                                    parser={brazilianParser}
                                    onChange={(val) => setValeRefeicao(val)}
                                />
                            </Item>
                        </Col>
                        <Col>
                            <Item
                                name="valeTransporte"
                                label="Vale Transporte"
                            >
                                <InputNumber
                                    prefix="R$"
                                    style={{ width: '100%' }}
                                    step={0.01}                                    
                                    disabled
                                    value={valeTransporte}
                                    formatter={brazilianFormatter}
                                    parser={brazilianParser}
                                    onChange={(val) => setValeTransporte(val)}
                                />
                            </Item>
                        </Col>
                        <Col>
                            <Item
                                name="visualizarEscalas"                                    
                                valuePropName='checked'
                                label="Escalas"
                            >
                                <Checkbox
                                    disabled
                                >
                                    Visualizar Escalas
                                </Checkbox>
                            </Item>
                        </Col>                                
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col span={18}>
                            <Item
                                name="empresas"
                                label={"Empresa"}
                                rules={[{required: true, 
                                        message: 'Informar Empresa'}]}
                                >
                                <Select
                                    placeholder="Selecionar Empresa"
                                    optionLabelProp='label'
                                    mode="multiple"
                                    allowClear  //Permite limpar seleção
                                    disabled
                                    //Mapeia o array de empresas
                                    options={
                                        empresas.map( emp => ({
                                            value: emp._id,
                                            label: emp.nome
                                        }))
                                    }
                                >
                                </Select>
                            </Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

        </Spin>

    </div>

  )
}

export default UsersComponent