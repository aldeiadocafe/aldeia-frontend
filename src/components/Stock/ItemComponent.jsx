import { useEffect, useState } from 'react'
import { AppstoreAddOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined, EyeOutlined, FileSearchOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Input, Button, Space, Modal, Form, message, Tooltip, Popconfirm, Spin, Select, InputNumber, Row, Col} from 'antd'
import Title from 'antd/es/typography/Title';

import { createItem, deleteItem, getAllItems, updateItem } from '../../services/ItemService';
import { getAllUnits } from '../../services/UnitService';
import { useAuth } from '../Login/AuthContext';
import { normalizarTexto } from '../../Funcoes/Utils';

const ItemComponent = () => {

    const { user } = useAuth();

    const [dados,           setDados]           = useState([]);
    const [selectUnits,     setSelectUnits]     = useState([]);
    const [searchText,      setSearchText]      = useState('');
    const [SelectedRowKeys, setSelectedRowKeys] = useState();

    const [deleteModal,     setDeleteModal]     = useState(false);
    const [formModal,       setFormModal]       = useState(false);
    const [confirmLoading,  setConfirmLoading]  = useState(false);
    const [loading,         setLoading]         = useState(false);
    
    const [form]    = Form.useForm();
    const { Item }  = Form;

    const [isEditing,   setIsEditing]   = useState(true);
    const [idItem,      setIdItem]      = useState();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    
    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 3,
    });

    const { Option, OptGroup } = Select;

    //Aplique estilos CSS para centralizar a div container na tela
    const containerPopconfirm = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Ocupa 100% da altura da viewport para centralizar verticalmente
    }

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
            dataIndex:  "itCodigo",
            title:      "Item",
            key:        "itCodigo",
            sorter: (a, b) => a.itCodigo.localeCompare(b.itCodigo),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('itCodigo'),
            ellipsis: true,
        },
        {
            dataIndex:  "descricao",
            title:      "Descrição",
            key:        'descricao',
            sorter: (a, b) => a.descricao.localeCompare(b.descricao),
            defaultSortOrder: 'ascend', 
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('descricao'),
            ellipsis: true,
        },
        {
            dataIndex:  "unitDescricao",
            title:      "Unidade Medida",
            sorter: (a, b) => a.unitDescricao.localeCompare(b.unitDescricao),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('unitDescricao'),
            ellipsis: true,
        },
        {
            dataIndex:  "quantidadeMinima",
            title:      "Qtde Mínima",
            sorter: (a, b) => a.quantidadeMinima - b.quantidadeMinima,
            showSorterTooltip: { target: 'sorter-icon' }, 
            align: 'right',
            render: (value) => formatter.format(value)
        },
        {
            dataIndex:  "situacao",
            title:      "Situação",
            sorter: (a, b) => a.situacao.localeCompare(b.situacao),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('situacao'),
            ellipsis: true,
        },
    ]

    const gravarDados = (values) => {

        const item = {
            _id:                values._id,
            itCodigo:           values.itCodigo.toUpperCase(),
            descricao:          values.descricao.toUpperCase(),
            unit:               values.unit,
            situacao:           values.situacao.toUpperCase(),
            quantidadeMinima:   values.quantidadeMinima,
            usuarioCriacao:     user ? user._id : null,
            usuarioAlteracao:   user ? user._id : null,
        };

        setLoading(true);    

        if (!values._id) {

            createItem(item).then((response) => {
                message.success('Registro criado com sucesso!')
                form.resetFields(); //Limpa os campos ao fechar
                carregarDados();

            }).catch((error)=> {

                if (error.response) {
                    message.error(error.response.data || 'Erro no servidor');
                } else {
                    message.error('Erro ao criar!');
                }
            });
        } else {

            updateItem(values._id, item).then((response) => {

                message.success('Registro atualizado com sucesso!')
                form.resetFields(); //Limpa os campos ao fechar
                carregarDados();
                setFormModal(false)

            }).catch((error)=> {

                if (error.response) {
                    message.error(error.response.data || 'Erro no servidor');
                } else {
                    message.error('Erro ao atualizar!');
                }
            });
            
        }        
        setLoading(false);    
 
    };

    const handleCancel = () => {        
        setFormModal(false);
        setDeleteModal(false);
        setIsPopupOpen(false);
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

    const carregarDados = async () => {

        try {

            setLoading(true);

            setDados([])
            await getAllItems().then((response) => {

                // Ler Array
                const dadosAux = response.data.map(item => ({
                    _id:                item._id,
                    itCodigo:           item.itCodigo,
                    descricao:          item.descricao,
                    unit:               item.unit,
                    unitDescricao:      item.unit?.descricao,
                    situacao:           item.situacao,
                    quantidadeMinima:   item.quantidadeMinima
                }))

                setDados(dadosAux);

            });


        } catch (error) {
            console.error(error);
        } finally {

            setSelectedRowKeys([]);
            setLoading(false);
    
        }

    }

    const carregarSelectUnit = async () => {

        setLoading(true)

        await getAllUnits().then((response) => {

            // Formatar os dados
            const formatarDados = response.data.map((unit) => ({
                value: unit._id,
                label: unit.descricao
            }))

            setSelectUnits(formatarDados)

        }).catch((error) => {
            console.error(error)
        })

        setLoading(false)
        
    }

    useEffect(() => {
        carregarSelectUnit()
        carregarDados();
    },[]);

    const showFormModal = () => {

        setIsEditing(true);
        setIdItem();
        if(form) {
            form.resetFields(); //Limpa os campos ao fechar
        }

        setFormModal(true);
    };

    const btnVisualizar = (value) => {

        setIsEditing(false)
        if(value) {

            setIdItem(value._id)
            form.setFieldsValue({
                _id:                value._id,
                itCodigo:           value.itCodigo,
                descricao:          value.descricao,
                unit:               value.unit._id,
                situacao:           value.situacao,
                quantidadeMinima:   value.quantidadeMinima
            })

            setFormModal(true);
                
        }
            
    }

    const btnEditar = (value) => {

        setIsEditing(true);
        setFormModal(true);

        if(value) {

            setIdItem(value._id)
            form.setFieldsValue({
                _id:                value._id,
                itCodigo:           value.itCodigo,
                descricao:          value.descricao,
                unit:               value.unit._id,
                situacao:           value.situacao,
                quantidadeMinima:   value.quantidadeMinima
            })

        }

    }

    const btnEliminar = (value) => {

        setIsEditing(false)
        setDeleteModal(true);

        if(value) {

            form.setFieldsValue({
                _id:                value._id,
                itCodigo:           value.itCodigo,
                descricao:          value.descricao,
                unit:               value.unit._id,
                situacao:           value.situacao,
                quantidadeMinima:   value.quantidadeMinima
            })
        }
    }

    // Chamado se o usuário confirmar na Popconfirm
    const handlePopupConfirm = async () => {

        if(form.getFieldValue('_id')){

            return await deleteItem(form.getFieldValue('_id')).then((response) => {

                setDeleteModal(false); // Fecha o Modal principal                
                message.success('Registro eliminado com sucesso!')

                form.resetFields(); //Limpa os campos ao fechar
                carregarDados();

            }).catch((error)=> {

                if (error.response) {  

                    message.error(error.response.data.message || error.response.data || 'Ocorreu um erro inesperado');
                } else {
                    message.error('Erro ao eliminar!');
                }
            });
        }
            
    };

    // Chamado se o usuário cancelar na Popconfirm
    const handlePopupCancel = () => {
        setIsPopupOpen(false); // Apenas fecha o Popconfirm e mantém o Modal aberto
    };


  return (
    <div>

        <Spin 
        spinning={loading} 
        size='large' 
        tip="Carregando..."
        >

            <div style={{ textAlign: 'center' }}>
                <Title level={2}
                    style={{ color: 'var(--primary-color)'}}
                >Item</Title>
            </div>

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
                tableLayout='auto'
                size={'small'}
                scroll={{ y: 'calc(80vh - 90px)' }}                
                rowKey={(record) => record._id}
                pagination={false}
            />

            {/* Modal de Form */}
            <Modal
                title={ "Cadastro de Item"}
                open={formModal}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}        
                onOk={handleOk}
            >        
                <Form
                    form={form}
                    layout='vertical'
                    initialValues={{situacao: 'ATIVO'}}
                    >
                    <Item
                        name={"_id"}
                        style={{ display: 'none'}}
                    >
                        <Input />
                    </Item>
                    <Item
                        name={"itCodigo"}
                        label="Item"
                        rules={[{required: true, message: 'Informar o Código do Item'}]}
                        >
                        <Input 
                            disabled={!isEditing || idItem}
                            style={{ textTransform: 'uppercase' }}
                            placeholder='Ex: Código 60000639'/>
                    </Item>
                    <Item
                        name={"descricao"}
                        label="Descrição"
                        rules={[{required: true, message: 'Informar Descrição'}]}
                        >
                        <Input 
                            disabled={!isEditing}
                            style={{ textTransform: 'uppercase' }}
                            placeholder='Ex: Coca Cola'/>
                    </Item>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Item
                                name="unit"
                                label="Unidade Medida"
                                rules={[{required: true, 
                                        message: 'Informar Unidade de Medida'}]}
                                >
                                <Select
                                    disabled={!isEditing}
                                    placeholder="Selecionar Unid Medida"
                                    allowClear  //Permite limpar seleção
                                    loading={loading}   // Mostrar ícone de carregamento
                                    options={selectUnits}
                                >
                                </Select>
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                name={"quantidadeMinima"}
                                key={"quantidadeMinima"}
                                label="Qtde Mínima"
                                >
                                <InputNumber 
                                    disabled={!isEditing}
                                    placeholder='Quantidade mínima de estoque'
                                    decimalSeparator=','
                                    />
                            </Item>
                        </Col>
                    </Row>
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
                </Form>

            </Modal>

            <Modal
                title={ "Eliminar Item"}
                open={deleteModal}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}        
                onOk={() => setIsPopupOpen(true)}
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
                        name={"itCodigo"}
                        label="Item"
                        >
                        <Input 
                            disabled={!isEditing || idItem}
                            style={{ textTransform: 'uppercase' }}
                            placeholder='Ex: Código 60000639'/>                    
                    </Item>
                    <Item
                        name={"descricao"}
                        label="Descrição"
                        rules={[{required: true, message: 'Informar Descrição'}]}
                        >
                        <Input 
                            disabled={!isEditing}
                            style={{ textTransform: 'uppercase' }}
                            placeholder='Ex: Coca Cola'/>
                    </Item>
                    <Item
                        name="unit"
                        label="Unidade Medida"
                        rules={[{required: true, 
                                message: 'Informar Unidade de Medida'}]}
                        >
                        <Select
                            disabled={!isEditing}
                            placeholder="Selecionar Unid Medida"
                            allowClear  //Permite limpar seleção
                            loading={loading}   // Mostrar ícone de carregamento
                            options={selectUnits}
                        >
                        </Select>
                    </Item>
                    <Col>
                        <Item
                            name={"quantidadeMinima"}
                            key={"quantidadeMinima"}
                            label="Qtde Mínima"
                            >
                            <InputNumber 
                                disabled={!isEditing}
                                placeholder='Quantidade mínima de estoque'
                                decimalSeparator=','
                                />
                        </Item>
                    </Col>
                    <Item
                        name={"situacao"}
                        key={"situacao"}
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
                </Form>

                {/* Modal de Eliminar */}
                <div style={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center', 
                    }}>
                    <Popconfirm
                        title="Confirma a exclusão do registro?"
                        description="Ao confirmar o registro será elimando permanentemente."
                        open={isPopupOpen}
                        onConfirm={handlePopupConfirm}
                        onCancel={handlePopupCancel}
                        okText="Sim"
                        cancelText="Não"            
                    />
                </div>
                

            </Modal>

        </Spin>

    </div>

  )
}

export default ItemComponent