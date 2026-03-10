import { useEffect, useState } from 'react'
import { AppstoreAddOutlined, CheckOutlined, CheckSquareOutlined, DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Input, Button, Space, Modal, Form, message, Tooltip, Popconfirm, Spin, Select, DatePicker} from 'antd'
import { PatternFormat } from 'react-number-format'; // Recomendado: PatternFormat para máscaras fixas
import Title from 'antd/es/typography/Title';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { createCompany, deleteCompany, endCompany, getAllCompanys, updateCompany } from '../services/CompanyService';

dayjs.extend(utc)

const ListCompanysComponent = () => {
    
    const [tabela,          setTabela]          = useState(1);
    const [dados,           setDados]           = useState([]);
    const [searchText,      setSearchText]      = useState('');
    const [SelectedRowKeys, setSelectedRowKeys] = useState();

    const [deleteModal,     setDeleteModal]     = useState(false);
    const [formModal,       setFormModal]       = useState(false);
    const [confirmLoading,  setConfirmLoading]  = useState(false);
    const [loading,         setLoading]         = useState(false);
    
    const [form]    = Form.useForm();
    const { Item }  = Form;

    const [isEditing, setIsEditing]                 = useState(true);
    const [idCompany, setIdCompany]             = useState();
    
    const { Option, OptGroup } = Select;

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
            title:      "CNPJ",
            dataIndex:  "cnpj",
            key:        "cnpj",
            sorter: (a, b) => a.cnpj.localeCompare(b.cnpj),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('cnpj'),
            onFilter: (value, record) => record.cnpj.indexOf(value) === 0,      
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
            title:      "Razão Social",
            dataIndex:  "razaoSocial",
            key:        "razaoSocial",
            sorter: (a, b) => a.razaoSocial.localeCompare(b.razaoSocial),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('razaoSocial'),
            onFilter: (value, record) => record.razaoSocial.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            title:      "Insc Estadual",
            dataIndex:  "inscricaoEstadual",
            key:        "inscricaoEstadual",
            sorter: (a, b) => a.inscricaoEstadual.localeCompare(b.inscricaoEstadual),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('inscricaoEstadual'),
            onFilter: (value, record) => record.inscricaoEstadual.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            title:      "Endereço",
            dataIndex:  "endereco",
            key:        "endereco",
            sorter: (a, b) => a.endereco.localeCompare(b.endereco),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('endereco'),
            onFilter: (value, record) => record.endereco.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            title:      "Nro",
            dataIndex:  "numero",
            key:        "numero",
            sorter: (a, b) => a.numero.localeCompare(b.numero),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('numero'),
            onFilter: (value, record) => record.numero.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            title:      "Compl",
            dataIndex:  "complemento",
            key:        "complemento",
            sorter: (a, b) => a.complemento.localeCompare(b.complemento),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('complemento'),
            onFilter: (value, record) => record.complemento.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            title:      "Bairro",
            dataIndex:  "bairro",
            key:        "bairro",
            sorter: (a, b) => a.bairro.localeCompare(b.bairro),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('bairro'),
            onFilter: (value, record) => record.bairro.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            title:      "Município",
            dataIndex:  "municipio",
            key:        "municipio",
            sorter: (a, b) => a.municipio.localeCompare(b.bairro),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('municipio'),
            onFilter: (value, record) => record.municipio.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            title:      "Estado",
            dataIndex:  "estado",
            key:        "estado",
            sorter: (a, b) => a.estado.localeCompare(b.estado),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('estado'),
            onFilter: (value, record) => record.estado.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            title:      "CEP",
            dataIndex:  "cep",
            key:        "cep",
            sorter: (a, b) => a.cep.localeCompare(b.cep),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('cep'),
            onFilter: (value, record) => record.cep.indexOf(value) === 0,      
            ellipsis: true,
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
            title:      "Telefone",
            dataIndex:  "telefone",
            key:        "telefone",
            sorter: (a, b) => a.telefone.localeCompare(b.telefone),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('telefone'),
            onFilter: (value, record) => record.telefone.indexOf(value) === 0,      
            ellipsis: true,
        },
    ]

    const gravarDados = (values) => {

        const company = {
            _id:               values._id,
            cnpj:              values.cnpj, //values.cnpj.replace(/\D/g, ''), Para enviar apenas os números:
            razaoSocial:       values.razaoSocial.toUpperCase(),
            nome:              values.nome.toUpperCase(),
            inscricaoEstadual: values.inscricaoEstadual.toUpperCase(),
            endereco:          values.endereco.toUpperCase(),
            numero:            values.numero.toUpperCase(),
            complemento:       values.complemento.toUpperCase(),
            bairro:            values.bairro.toUpperCase(),
            municipio:         values.municipio.toUpperCase(),
            estado:            values.estado.toUpperCase(),
            cep:               values.cep,
            email:             values.email.toUpperCase(),
            telefone:          values.telefone
        };

        setLoading(true);    

        if (!values._id) {

            createCompany(company).then((response) => {
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

            updateCompany(values._id, company).then((response) => {

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

    const handleOk = async () => {

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

    const carregarDados = () => {
        setLoading(true);

        setDados([])
        getAllCompanys().then((response) => {
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
        carregarDados();
    },[]);


    const handleReset = (clearFilters, confirm) => {
        clearFilters();
        setSearchText({});
        confirm();
    };

    const showFormModal = () => {

        setIsEditing(true);
        setIdCompany();
        if(form) {
            form.resetFields(); //Limpa os campos ao fechar
        }

        setFormModal(true);
    };

    const btnVisualizar = (value) => {

        setIsEditing(false)
        if(value) {

            setIdCompany(value._id)
            form.setFieldsValue({
                _id:               value._id,
                cnpj:              value.cnpj,
                razaoSocial:       value.razaoSocial.toUpperCase(),
                nome:              value.nome.toUpperCase(),
                inscricaoEstadual: value.inscricaoEstadual.toUpperCase(),
                endereco:          value.endereco.toUpperCase(),
                numero:            value.numero.toUpperCase(),
                complemento:       value.complemento.toUpperCase(),
                bairro:            value.bairro.toUpperCase(),
                municipio:         value.municipio.toUpperCase(),
                estado:            value.estado.toUpperCase(),
                cep:               value.cep,
                email:             value.email.toUpperCase(),
                telefone:          value.telefone
            })

            setFormModal(true);
                
        }
            
    }

    const btnEditar = (value) => {

        setIsEditing(true);
        setFormModal(true);

        if(value) {

            setIdCompany(value._id)
            form.setFieldsValue({
                _id:               value._id,
                cnpj:              value.cnpj,
                razaoSocial:       value.razaoSocial.toUpperCase(),
                nome:              value.nome.toUpperCase(),
                inscricaoEstadual: value.inscricaoEstadual.toUpperCase(),
                endereco:          value.endereco.toUpperCase(),
                numero:            value.numero.toUpperCase(),
                complemento:       value.complemento.toUpperCase(),
                bairro:            value.bairro.toUpperCase(),
                municipio:         value.municipio.toUpperCase(),
                estado:            value.estado.toUpperCase(),
                cep:               value.cep,
                email:             value.email.toUpperCase(),
                telefone:          value.telefone
            })

        }

    }

    const btnEliminar = (value) => {

        setIsEditing(false)
        setDeleteModal(true);

        if(value) {

            form.setFieldsValue({
                _id:               value._id,
                cnpj:              value.cnpj,
                razaoSocial:       value.razaoSocial.toUpperCase(),
                nome:              value.nome.toUpperCase(),
                inscricaoEstadual: value.inscricaoEstadual.toUpperCase(),
                endereco:          value.endereco.toUpperCase(),
                numero:            value.numero.toUpperCase(),
                complemento:       value.complemento.toUpperCase(),
                bairro:            value.bairro.toUpperCase(),
                municipio:         value.municipio.toUpperCase(),
                estado:            value.estado.toUpperCase(),
                cep:               value.cep,
                email:             value.email.toUpperCase(),
                telefone:          value.telefone
            })
        }
    }

    // Chamado se o usuário confirmar na Popconfirm
    const handlePopupConfirm = () => {
        
        if(form.getFieldValue('_id')){

            deleteCompany(form.getFieldValue('_id')).then((response) => {
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
            >Inventário</Title>
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
            <Item
                name="cnpj"
                label="CNPJ"
                rules={[
                    { required: true, message: 'Por favor, insira o CNPJ' },
                    {
                        validator: (_, value) => {
                        if (!value || value.replace(/\D/g, '').length === 14) {
                            return Promise.resolve();
                        }
                        return Promise.reject(new Error('CNPJ inválido (14 dígitos)'));
                        },
                    },
                    ]}
            >
                {/* Componente de Máscara integrado ao Input do Antd */}
                <PatternFormat
                    customInput={Input} // Usa o estilo do Ant Design
                    format="##.###.###/####-##"
                    mask="_"
                    placeholder="00.000.000/0000-00"
                    onValueChange={(values) => {
                        // Isso garante que o valor seja atualizado no estado do formulário do Ant Design
                        Form.useForm()[0]?.setFieldsValue({
                            cnpj: values.value,
                        });      
/*                        
                        console.log(values.formattedValue); // Valor com máscara: ABC-1234
                        console.log(values.value); // Valor sem máscara: ABC1234
*/                                              
                    }}
                />            
            </Item>
            <Item
                name={"nome"}
                label="Nome"
                rules={[{required: true, message: 'Informar Nome'}]}
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    />
            </Item>
            <Item
                name={"razaoSocial"}
                label="Razão Social"
                rules={[{required: true, message: 'Informar Razão Social'}]}
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    />
            </Item>
            <Item
                name={"inscricaoEstadual"}
                label="Insc Estadual"
                >
                {/* Componente de Máscara integrado ao Input do Antd */}
                <PatternFormat
                    customInput={Input} // Usa o estilo do Ant Design
                    format="AA.AAA.AAA-A"   // A- Letra, # Numero
                    mask="_"
                    placeholder="XX.XXX.XXX-X"
                    onValueChange={(values) => {
                        // Isso garante que o valor seja atualizado no estado do formulário do Ant Design
                        Form.useForm()[0]?.setFieldsValue({
                            inscricaoEstadual: values.value,
                        });      
/*                        
                        console.log(values.formattedValue); // Valor com máscara: ABC-1234
                        console.log(values.value); // Valor sem máscara: ABC1234
*/                                              
                    }}
                />            
            </Item>
            <Item
                name={"endereco"}
                label="Endereço"
                rules={[{required: true, message: 'Informar Endereço'}]}
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    />
            </Item>
            <Item
                name={"numero"}
                label="Nro"
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    />
            </Item>
            <Item
                name={"complemento"}
                label="Complemento"
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    />
            </Item>
            <Item
                name={"bairro"}
                label="Bairro"
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    />
            </Item>
            <Item
                name={"municipio"}
                label="Município"
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    />
            </Item>
            <Item
                name={"estado"}
                label="Estado"
                >
                {/* Componente de Máscara integrado ao Input do Antd */}
                <PatternFormat
                    customInput={Input} // Usa o estilo do Ant Design
                    format="AA"   // A- Letra, # Numero
                    mask="_"
                    placeholder="XX"
                    onValueChange={(values) => {
                        // Isso garante que o valor seja atualizado no estado do formulário do Ant Design
                        Form.useForm()[0]?.setFieldsValue({
                            estado: values.value,
                        });      
                    }}
                />            
            </Item>
            <Item
                name={"cep"}
                label="CEP"
                >
                {/* Componente de Máscara integrado ao Input do Antd */}
                <PatternFormat
                    customInput={Input} // Usa o estilo do Ant Design
                    format="#####-###"   // A- Letra, # Numero
                    mask="_"
                    placeholder="00000-000"
                    onValueChange={(values) => {
                        // Isso garante que o valor seja atualizado no estado do formulário do Ant Design
                        Form.useForm()[0]?.setFieldsValue({
                            cep: values.value,
                        });      
                    }}
                />            
            </Item>
            <Item
                name={"email"}
                label="E-mail"
                rules={[
                    {required: true, message: 'Informar E-mail'},
                    {type: 'email',  message: 'O e-mail inserido não é válido!'}
                ]}
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    placeholder="seu.email@exemplo.com"
                    />
            </Item>
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
                    onValueChange={(values) => {
                        // Isso garante que o valor seja atualizado no estado do formulário do Ant Design
                        Form.useForm()[0]?.setFieldsValue({
                            telefone: values.value,
                        });      
                    }}
                />            
            </Item>
        </Form>

      </Modal>

      <Modal
        title={ "Eliminar Empresa"}
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
            <Item
                name="cnpj"
                label="CNPJ"
                rules={[
                    { required: true, message: 'Por favor, insira o CNPJ' },
                    {
                        validator: (_, value) => {
                        if (!value || value.replace(/\D/g, '').length === 14) {
                            return Promise.resolve();
                        }
                        return Promise.reject(new Error('CNPJ inválido (14 dígitos)'));
                        },
                    },
                    ]}
            >
                {/* Componente de Máscara integrado ao Input do Antd */}
                <PatternFormat
                    customInput={Input} // Usa o estilo do Ant Design
                    format="##.###.###/####-##"
                    mask="_"
                    placeholder="00.000.000/0000-00"
                    onValueChange={(values) => {
                        // Isso garante que o valor seja atualizado no estado do formulário do Ant Design
                        Form.useForm()[0]?.setFieldsValue({
                            cnpj: values.value,
                        });      
/*                        
                        console.log(values.formattedValue); // Valor com máscara: ABC-1234
                        console.log(values.value); // Valor sem máscara: ABC1234
*/                                              
                    }}
                />            
            </Item>
            <Item
                name={"nome"}
                label="Nome"
                rules={[{required: true, message: 'Informar Nome'}]}
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    />
            </Item>
            <Item
                name={"razaoSocial"}
                label="Razão Social"
                rules={[{required: true, message: 'Informar Razão Social'}]}
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    />
            </Item>
            <Item
                name={"inscricaoEstadual"}
                label="Insc Estadual"
                >
                {/* Componente de Máscara integrado ao Input do Antd */}
                <PatternFormat
                    customInput={Input} // Usa o estilo do Ant Design
                    format="AA.AAA.AAA-A"   // A- Letra, # Numero
                    mask="_"
                    placeholder="XX.XXX.XXX-X"
                    onValueChange={(values) => {
                        // Isso garante que o valor seja atualizado no estado do formulário do Ant Design
                        Form.useForm()[0]?.setFieldsValue({
                            inscricaoEstadual: values.value,
                        });      
/*                        
                        console.log(values.formattedValue); // Valor com máscara: ABC-1234
                        console.log(values.value); // Valor sem máscara: ABC1234
*/                                              
                    }}
                />            
            </Item>
            <Item
                name={"endereco"}
                label="Endereço"
                rules={[{required: true, message: 'Informar Endereço'}]}
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    />
            </Item>
            <Item
                name={"numero"}
                label="Nro"
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    />
            </Item>
            <Item
                name={"complemento"}
                label="Complemento"
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    />
            </Item>
            <Item
                name={"bairro"}
                label="Bairro"
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    />
            </Item>
            <Item
                name={"municipio"}
                label="Município"
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    />
            </Item>
            <Item
                name={"estado"}
                label="Estado"
                >
                {/* Componente de Máscara integrado ao Input do Antd */}
                <PatternFormat
                    customInput={Input} // Usa o estilo do Ant Design
                    format="AA"   // A- Letra, # Numero
                    mask="_"
                    placeholder="XX"
                    onValueChange={(values) => {
                        // Isso garante que o valor seja atualizado no estado do formulário do Ant Design
                        Form.useForm()[0]?.setFieldsValue({
                            estado: values.value,
                        });      
                    }}
                />            
            </Item>
            <Item
                name={"cep"}
                label="CEP"
                >
                {/* Componente de Máscara integrado ao Input do Antd */}
                <PatternFormat
                    customInput={Input} // Usa o estilo do Ant Design
                    format="#####-###"   // A- Letra, # Numero
                    mask="_"
                    placeholder="00000-000"
                    onValueChange={(values) => {
                        // Isso garante que o valor seja atualizado no estado do formulário do Ant Design
                        Form.useForm()[0]?.setFieldsValue({
                            cep: values.value,
                        });      
                    }}
                />            
            </Item>
            <Item
                name={"email"}
                label="E-mail"
                rules={[
                    {required: true, message: 'Informar E-mail'},
                    {type: 'email',  message: 'O e-mail inserido não é válido!'}
                ]}
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    placeholder="seu.email@exemplo.com"
                    />
            </Item>
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
                    onValueChange={(values) => {
                        // Isso garante que o valor seja atualizado no estado do formulário do Ant Design
                        Form.useForm()[0]?.setFieldsValue({
                            telefone: values.value,
                        });      
                    }}
                />            
            </Item>
        </Form>


      </Modal>

    </div>

  )
}

export default ListCompanysComponent