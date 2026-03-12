import { useEffect, useState } from 'react'
import { AppstoreAddOutlined, CheckOutlined, CheckSquareOutlined, DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined, EyeTwoTone, SearchOutlined } from '@ant-design/icons';
import { Table, Input, Button, Space, Modal, Form, message, Tooltip, Popconfirm, Spin, Select, DatePicker, Row, Col} from 'antd'
import { PatternFormat } from 'react-number-format'; // Recomendado: PatternFormat para máscaras fixas
import { cpf, cnpj } from 'cpf-cnpj-validator';

import Title from 'antd/es/typography/Title';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { createUser, deleteUser, getAllUsers, updateUser } from '../../services/UserService';
import { getAllCompanys } from '../../services/CompanyService';

dayjs.extend(utc)

const ListUsersComponent = () => {
    
    const [tabela,          setTabela]          = useState(1);
    const [dados,           setDados]           = useState([]);
    const [searchText,      setSearchText]      = useState('');
    const [SelectedRowKeys, setSelectedRowKeys] = useState();

    const [selectCompanys,  setSelectCompanys]  = useState([])

    const [deleteModal,     setDeleteModal]     = useState(false);
    const [formModal,       setFormModal]       = useState(false);
    const [confirmLoading,  setConfirmLoading]  = useState(false);
    const [loading,         setLoading]         = useState(false);
    
    const [form]    = Form.useForm();
    const { Item }  = Form;

    const [isEditing, setIsEditing]             = useState(true);
    const [idUser, setIdUser]             = useState();

    // Exemplo: Limitar para 4 linhas (4 * 32px = 128px)
    const limitHeight = 4 * 32; 

    //Aplique estilos CSS para centralizar a div container na tela
    const containerPopconfirm = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Ocupa 100% da altura da viewport para centralizar verticalmente
    }

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
        <div style={{ padding: 8 }}>
            <Input
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value.toUpperCase()] : [])}
            onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
            style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
            <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
            >
                Search
            </Button>
            <Button
                onClick={() => handleReset(clearFilters, confirm)}
                size="small"
                style={{ width: 90 }}
            >
                Reset
            </Button>
            </Space>
        </div>
        ),
        filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) => 
        record[dataIndex].toString().toUpperCase().includes(value.toUpperCase()),
    });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        // Note: The actual data filtering happens internally via the 'onFilter' prop, 
        // but you can manage a state here if needed for other components.
    };

    const colunas = 
    [
        {
            title: 'Ação',
            key: 'action',
            width: 130,
            align: 'center',
            render: (text, record) => (
                <Space size="small">

                    <Tooltip title="Visualizar">
                        <Button
                            type="primary"
                            shape='circle'
                            className={'rotate-icon'}
                            icon={<EyeOutlined rotate={0} />}
                            onClick={() => btnVisualizar(record)}
                        />
                    </Tooltip>       

                    <Tooltip title="Editar">
                        <Button
                            type="primary"
                            shape='circle'
                            className={'rotate-icon'}
                            icon={<EditOutlined rotate={0} />}
                            onClick={() => btnEditar(record)}
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
            title:      "E-mail",
            dataIndex:  "email",
            key:        "email",
            sorter: (a, b) => a.email.localeCompare(b.email),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('email'),
            onFilter: (value, record) => record.email.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            title:      "Nome",
            dataIndex:  "nome",
            key:        "nome",
            sorter: (a, b) => a.nome.localeCompare(b.nome),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('nome'),
            onFilter: (value, record) => record.nome.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            title:      "Telefone",
            dataIndex:  "telefone",
            key:        "telefone",
            sorter: (a, b) => a.telefone.localeCompare(b.telefone),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('telefone'),
            onFilter: (value, record) => record.telefone.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            title:      "Situação",
            dataIndex:  "situacao",
            key:        "situacao",
            sorter: (a, b) => a.situacao.localeCompare(b.situacao),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('situacao'),
            onFilter: (value, record) => record.situacao.indexOf(value) === 0,      
            ellipsis: true,
        },
    ]

    const gravarDados = (values) => {

        const user = {
            _id:        values._id,
            email:      values.email.toUpperCase(),
            nome:       values.nome.toUpperCase(),
            senha:      values.senha,
            telefone:   values.telefone ? values.telefone.replace(/\D/g, '') : "",
            companys:   values.companys
        };

        setLoading(true);    

        if (!values._id) {

            createUser(user).then((response) => {
                message.success('Registro criado com sucesso!')
                form.resetFields(); //Limpa os campos ao fechar
                carregarDados();
                //setFormModal(false)


            }).catch((error)=> {
                if (error.response) {
                    message.error(error.response.data || 'Erro no servidor');
                } else {
                    message.error('Erro ao criar!');
                }
            });
        } else {

            updateUser(values._id, user).then((response) => {

                message.success('Registro atualizado com sucesso!')
                form.resetFields(); //Limpa os campos ao fechar
                carregarDados();
                setFormModal(false)

            }).catch((error)=> {

                if (error.response) {
                    message.error(error.response.data || 'Erro no servidor');
                } else {
                    message.error('Erro ao criar!');
                }
            });
            
        }        
            
        setLoading(false);    
 
    };

    const handleCancel = () => {        
        setFormModal(false);
        setDeleteModal(false);
        form.resetFields(); //Limpa os campos ao fechar
        carregarDados();
    };

    const handleOk = async (event) => {

        if (isEditing) {

            try {

                const values = await form.validateFields();

                //Prossiga com a acao
                gravarDados(values);

            } catch (errorInfo) {

                message.info('Verificar campo(s)!');
            }

        } else {
            setFormModal(false)
        }
    }

    const carregarSelectCompany = async () => {

        setLoading(true)

        setSelectCompanys([])

        await getAllCompanys().then((response) => {

            // Formatar os dados
            const formatarDados = response.data.map((company) => ({
                value: company._id,
                label: company.nome
            }))

            setSelectCompanys(formatarDados);

        }).catch((error)=> {
            console.error(error);
        });

        setLoading(false)

    }

    const carregarDados = async () => {

        setLoading(true);

        setDados([])
        await getAllUsers().then((response) => {

            const dadosAux = response.data.map(user => ({
                _id:        user._id,
                email:      user.email,
                nome:       user.nome,
                senha:      user.senha,
                telefone:   user.telefone,
                situacao:   user.situacao,
                companys:   user.companys,
            }))
            setDados(response.data);
        }).catch((error)=> {
            console.error(error);
        });

        setTimeout(() => {
        setSelectedRowKeys([]);
        setLoading(false);
        }, 1000);    

    }

    useEffect(() => {
        carregarSelectCompany()
        carregarDados();
    },[]);


    const handleReset = (clearFilters, confirm) => {
        clearFilters();
        setSearchText({});
        confirm();
    };

    const showFormModal = () => {

        setIsEditing(true);
        setIdUser();
        if(form) {
            form.resetFields(); //Limpa os campos ao fechar
        }

        setFormModal(true);
    };

    const btnVisualizar = (value) => {

        setIsEditing(false)
        if(value) {

            setIdUser(value._id)
            form.setFieldsValue({
                _id:            value._id,
                email:          value.email.toUpperCase(),
                nome:           value.nome.toUpperCase(),
                senha:          value.senha,
                telefone:       value.telefone,
                situacao:       value.situacao,
                companys:       value.companys
                                    ? value.companys.map(company => company._id)
                                    : null
            })

            setFormModal(true);

        }
            
    }

    const btnEditar = (value) => {

        setIsEditing(true);
        setFormModal(true);

        if(value) {

            setIdUser(value._id)
            form.setFieldsValue({
                _id:            value._id,
                email:          value.email.toUpperCase(),
                nome:           value.nome.toUpperCase(),
                senha:          value.senha,
                telefone:       value.telefone,
                situacao:       value.situacao,
                companys:       value.companys
                                    ? value.companys.map(company => company._id)
                                    : null
            })

        }

    }

    const btnEliminar = (value) => {

        setIsEditing(false)
        setDeleteModal(true);

        if(value) {

            form.setFieldsValue({
                _id:            value._id,
                email:          value.email.toUpperCase(),
                nome:           value.nome.toUpperCase(),
                senha:          value.senha,
                telefone:       value.telefone,
                situacao:       value.situacao,
                companys:       value.companys
                                    ? value.companys.map(company => company._id)
                                    : null
            })
        }
    }

    // Chamado se o usuário confirmar na Popconfirm
    const handlePopupConfirm = () => {
        
        if(form.getFieldValue('_id')){

            deleteUser(form.getFieldValue('_id')).then((response) => {
                message.success('Registro eliminado com sucesso!')
                form.resetFields(); //Limpa os campos ao fechar
                carregarDados();
                setDeleteModal(false); // Fecha o Modal principal

            }).catch((error)=> {
                if (error.response) {
                    message.error(error.response.data || 'Erro no servidor');
                } else {
                    message.error('Erro ao criar!');
                }
            });
        }
    };

  return (
    <div>

        <div style={{ textAlign: 'center' }}>
            <Title level={2}
                style={{ color: 'var(--primary-color)'}}
            >Empresa</Title>
        </div>

        <Spin
//            percent={"auto"}
            spinning={loading}
            fullscreen
        />


        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
                type='primary'
                icon={<AppstoreAddOutlined />}
                onClick={showFormModal}
                >
                    Cadastrar
            </Button>
            <br></br>
            <br></br>
        </div>
            
        <Table
            columns={colunas}
            dataSource={dados}      
            showSorterTooltip={true}
            size={'small'}
            scroll={{ y: 'calc(80vh - 90px)' }}                
            rowKey={(record) => record._id}
            pagination={{
                tabela,
                // The available options for items per page
                pageSizeOptions: ['5', '10', '20', '30'], 
                // Display the size changer
                showSizeChanger: true, 
                // Set the default page size
        //        defaultPageSize: 5,
                // Optional: show total items count
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                // Optional: update tabela page state on change
                onChange: (page) => {
                setTabela(page);
                },
            }}        
        />

      {/* Modal de Form */}
      <Modal
        title={ "Manutenção Cadastro Empresa"}
        width={"100vw"}
        style={{ top: 20, padding: 0, margin: 15 }}
        open={formModal}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}        
        onOk={handleOk}

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
                            disabled={!isEditing || idUser}
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
                            disabled={!isEditing}
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
                            disabled={!isEditing}
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
                            disabled={!isEditing}
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
                            disabled={!isEditing}
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
                <Col span={18}>
                    <Item
                        name="companys"
                        rules={[{required: true, 
                                message: 'Informar Empresa'}]}
                        >
                        <Select
                            prefix="Empresas"
                            disabled={!isEditing}
                            dropdownStyle={{ maxHeight: `${limitHeight}px`, overflow: 'auto' }}
                            placeholder="Selecionar Empresa"
                            mode="multiple"
                            allowClear  //Permite limpar seleção
                            loading={loading}   // Mostrar ícone de carregamento
                            options={selectCompanys}
                        >
                        </Select>
                    </Item>
                </Col>
            </Row>
        </Form>

      </Modal>

      <Modal
        title={ "Eliminar Empresa"}
        width={"100vw"}
        style={{ top: 20, padding: 0, margin: 15 }}
        open={deleteModal}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}        
//        onOk={() => setIsPopupOpen(true)}

        footer = {[
            <Button key="cancela" onClick={handleCancel}>
                Cancelar
            </Button>,
            <Popconfirm
                key="submit"
                title="Confirma a exclusão do registro?"
                description="Ao confirmar o registro será elimando permanentemente."
                onConfirm={handlePopupConfirm}  
                okText="Sim"
                cancelText="Não"            
                placement='topLeft'
                >
                <Button type="primary" loading={confirmLoading}>
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
                            disabled={!isEditing || idUser}
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
                            disabled={!isEditing}
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
                            disabled={!isEditing}
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
                            disabled={!isEditing}
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
                            disabled={!isEditing}
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
                <Col span={18}>
                    <Item
                        name="companys"
                        rules={[{required: true, 
                                message: 'Informar Empresa'}]}
                        >
                        <Select
                            prefix="Empresas"
                            disabled={!isEditing}
                            dropdownStyle={{ maxHeight: `${limitHeight}px`, overflow: 'auto' }}
                            placeholder="Selecionar Empresa"
                            mode="multiple"
                            allowClear  //Permite limpar seleção
                            loading={loading}   // Mostrar ícone de carregamento
                            options={selectCompanys}
                        >
                        </Select>
                    </Item>
                </Col>
            </Row>
        </Form>
      </Modal>

    </div>

  )
}

export default ListUsersComponent