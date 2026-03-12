import { useEffect, useState } from 'react'
import { AppstoreAddOutlined, CheckOutlined, CheckSquareOutlined, DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Input, Button, Space, Modal, Form, message, Tooltip, Popconfirm, Spin, Select, DatePicker, Row, Col} from 'antd'
import { PatternFormat } from 'react-number-format'; // Recomendado: PatternFormat para máscaras fixas
import { cpf, cnpj } from 'cpf-cnpj-validator';

import Title from 'antd/es/typography/Title';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { createCompany, deleteCompany, getAllCompanys, updateCompany } from '../../services/CompanyService';

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

    const [isEditing, setIsEditing]             = useState(true);
    const [idCompany, setIdCompany]             = useState();
    
    // 1. Função para aplicar a máscara no CNPJ
    const formatarCNPJ = (cnpj) => {
        if (!cnpj) return '';

        // Remove caracteres não numéricos
        const valor = cnpj.toString().replace(/\D/g, '');

        // Aplica a máscara: 00.000.000/0000-00
        return valor.replace(
            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
            '$1.$2.$3/$4-$5'
        );
    };

    const estadosBrasileiro = [
        { label: 'ACRE',                value: 'AC' },
        { label: 'ALAGOAS',             value: 'AL'},
        { label: 'AMAPÁ',               value: 'AP'},
        { label: 'AMAZONAS',            value: 'AM'},
        { label: 'BAHIA',               value: 'BA'},
        { label: 'CEARÁ',               value: 'CE'},
        { label: 'ESPÍRITO SANTO',      value: 'ES'},
        { label: 'GOIÁS',               value: 'GO'},
        { label: 'MARANHÃO',            value: 'MA'},
        { label: 'MATO GROSSO',         value: 'MT'},
        { label: 'MATO GROSSO DO SUL',  value: 'MS'},
        { label: 'MINAS GERAIS',        value: 'MG'},
        { label: 'PARÁ',                value: 'PA'},
        { label: 'PARAÍBA',             value: 'PB'},
        { label: 'PARANÁ',              value: 'PR'},
        { label: 'PERNAMBUCO',          value: 'PE'},
        { label: 'PIAUÍ',               value: 'PI'},
        { label: 'RIO DE JANEIRO',      value: 'RJ'},
        { label: 'RIO GRANDE DO NORTE', value: 'RN'},
        { label: 'RIO GRANDE DO SUL',   value: 'RS'},
        { label: 'RONDÔNIA',            value: 'RO'},
        { label: 'RORAIMA',             value: 'RR'},
        { label: 'SANTA CATARINA',      value: 'SC'},
        { label: 'SÃO PAULO',           value: 'SP'},
        { label: 'SERGIPE',             value: 'SE'},
        { label: 'TOCANTINS',           value: 'TO'},
    ];

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
            render: (text) => formatarCNPJ(text)
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
    ]

    const gravarDados = (values) => {

        const company = {
            _id:               values._id,
            cnpj:              values.cnpj ? values.cnpj.replace(/\D/g, '') : '', //Para enviar apenas os números:
            nome:              values.nome.toUpperCase(),
            razaoSocial:       values.razaoSocial.toUpperCase(),
            inscricaoEstadual: values.inscricaoEstadual ? values.inscricaoEstadual.toUpperCase() : '',
            endereco:          values.endereco.toUpperCase(),
            numero:            values.numero ? values.numero.toUpperCase() : '',
            complemento:       values.complemento ? values.complemento.toUpperCase() : '',
            bairro:            values.bairro ? values.bairro.toUpperCase() : '',
            municipio:         values.municipio ? values.municipio.toUpperCase() : '',
            estado:            values.estado ? values.estado.toUpperCase() : '',
            cep:               values.cep ? values.cep.replace(/\D/g, '') : "",
            email:             values.email ? values.email.toUpperCase() : '',
            telefone:          values.telefone ? values.telefone.replace(/\D/g, '') : ""
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

    // Regras personalizadas usando cpf-cnpj-validator
    const validateCpfCnpj = (_, value) => {

/*        
        if (!value) {
            return Promise.resolve(); // Permite vazio se não for 'required'
        }
*/

        // Remove pontuação para validar apenas os dígitos
        const cleanValue = value ? value.replace(/\D/g, '') : ''
/*
        if (cleanValue.length <= 11) {            
            // Valida CPF
            if (cpf.isValid(cleanValue)) {
            return Promise.resolve();
            }            
            return Promise.reject(new Error('CPF inválido!'));
        } else {
*/            
            // Valida CNPJ
            if (cnpj.isValid(cleanValue)) {
                return Promise.resolve();
            }
                return Promise.reject(new Error('CNPJ inválido!'));
//        }
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
                <Col span={6}>
                    <Item
                        name="cnpj"
                        label="CNPJ"
                        rules={[
                            { validator: validateCpfCnpj },
                            ]}
                    >
                        {/* Componente de Máscara integrado ao Input do Antd */}
                        <PatternFormat
                            disabled={!isEditing || idCompany}
                            customInput={Input} // Usa o estilo do Ant Design
                            format="##.###.###/####-##"
                            mask="_"
                            placeholder="00.000.000/0000-00"
                        />            
                    </Item>
                </Col>
                <Col span={5}>
                    <Item
                        name={"inscricaoEstadual"}
                        label="Insc Estadual"
                        >
                        <Input 
                            style={{ textTransform: 'uppercase' }}
                            disabled={!isEditing}
                            />
                    </Item>
                </Col>
            </Row>
            {/* 
                gutter={[horizontal, vertical]} 
                Aqui definimos 16px de espaçamento horizontal.
            */}            
            <Row gutter={[16, 16]}>
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
                <Col span={12}>
                    <Item
                        name={"razaoSocial"}
                        label="Razão Social"
                        rules={[{required: true, message: 'Informar Razão Social'}]}
                        >
                        <Input 
                            style={{ textTransform: 'uppercase' }}
                            disabled={!isEditing}
                            />
                    </Item>
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                <Col span={14}>
                    <Item
                        name={"endereco"}
                        label="Endereço"
                        rules={[{required: true, message: 'Informar Endereço'}]}
                        >
                        <Input 
                            style={{ textTransform: 'uppercase' }}
                            disabled={!isEditing}
                            />
                    </Item>
                </Col>
                <Col span={4}>
                    <Item
                        name={"numero"}
                        label="Nro"
                        >
                        <Input 
                            style={{ textTransform: 'uppercase' }}
                            disabled={!isEditing}
                            />
                    </Item>
                </Col>
                <Col span={6}>
                    <Item
                        name={"complemento"}
                        label="Complemento"
                        >
                        <Input 
                            style={{ textTransform: 'uppercase' }}
                            disabled={!isEditing}
                            />
                    </Item>
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <Item
                        name={"bairro"}
                        label="Bairro"
                        >
                        <Input 
                            style={{ textTransform: 'uppercase' }}
                            disabled={!isEditing}
                            />
                    </Item>
                </Col>
                <Col span={6}>
                    <Item
                        name={"municipio"}
                        label="Município"
                        >
                        <Input 
                            style={{ textTransform: 'uppercase' }}
                            disabled={!isEditing}
                            />
                    </Item>
                </Col>
                <Col span={6}>
                    <Item
                        name={"estado"}
                        label="Estado"
                        >
                        <Select
                            placeholder="Selecionar um Estado"
                            allowClear  //Permite limpar seleção
                            options={estadosBrasileiro}
                            disabled={!isEditing}
                        />
                    </Item>
                </Col>
                <Col span={4}>
                    <Item
                        name={"cep"}
                        label="CEP"
                        >
                        <PatternFormat
                            disabled={!isEditing}
                            customInput={Input} // Usa o estilo do Ant Design
                            format="#####-###"   // A- Letra, # Numero
                            mask="_"
                            placeholder="00000-000"
                        />            
                    </Item>
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                <Col span={5}>
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
                <Col span={19}>
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
                <Col span={6}>
                    <Item
                        name="cnpj"
                        label="CNPJ"
                        rules={[
                            { validator: validateCpfCnpj },
                            ]}
                    >
                        {/* Componente de Máscara integrado ao Input do Antd */}
                        <PatternFormat
                            disabled={!isEditing}
                            customInput={Input} // Usa o estilo do Ant Design
                            format="##.###.###/####-##"
                            mask="_"
                            placeholder="00.000.000/0000-00"
                        />            
                    </Item>
                </Col>
                <Col span={5}>
                    <Item
                        name={"inscricaoEstadual"}
                        label="Insc Estadual"
                        >
                        <Input 
                            disabled={!isEditing}
                            style={{ textTransform: 'uppercase' }}
                            />
                    </Item>
                </Col>
            </Row>
            {/* 
                gutter={[horizontal, vertical]} 
                Aqui definimos 16px de espaçamento horizontal.
            */}            
            <Row gutter={[16, 16]}>
                <Col span={12}>
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
                </Col>
                <Col span={12}>
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
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                <Col span={14}>
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
                </Col>
                <Col span={4}>
                    <Item
                        name={"numero"}
                        label="Nro"
                        >
                        <Input 
                            disabled={!isEditing}
                            style={{ textTransform: 'uppercase' }}
                            />
                    </Item>
                </Col>
                <Col span={6}>
                    <Item
                        name={"complemento"}
                        label="Complemento"
                        >
                        <Input 
                            disabled={!isEditing}
                            style={{ textTransform: 'uppercase' }}
                            />
                    </Item>
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <Item
                        name={"bairro"}
                        label="Bairro"
                        >
                        <Input 
                            disabled={!isEditing}
                            style={{ textTransform: 'uppercase' }}
                            />
                    </Item>
                </Col>
                <Col span={6}>
                    <Item
                        name={"municipio"}
                        label="Município"
                        >
                        <Input 
                            disabled={!isEditing}
                            style={{ textTransform: 'uppercase' }}
                            />
                    </Item>
                </Col>
                <Col span={6}>
                    <Item
                        name={"estado"}
                        label="Estado"
                        >
                        <Select
                            disabled={!isEditing}
                            placeholder="Selecionar um Estado"
                            allowClear  //Permite limpar seleção
                            options={estadosBrasileiro}
                        />
                    </Item>
                </Col>
                <Col span={4}>
                    <Item
                        name={"cep"}
                        label="CEP"
                        >
                        {/* Componente de Máscara integrado ao Input do Antd */}
                        <PatternFormat
                            disabled={!isEditing}
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
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                <Col span={5}>
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
                            onValueChange={(values) => {
                                // Isso garante que o valor seja atualizado no estado do formulário do Ant Design
                                Form.useForm()[0]?.setFieldsValue({
                                    telefone: values.value,
                                });      
                            }}
                        />            
                    </Item>
                </Col>
                <Col span={19}>
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
                </Col>
            </Row>
        </Form>
      </Modal>

    </div>

  )
}

export default ListCompanysComponent