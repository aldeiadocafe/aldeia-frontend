import { useEffect, useState } from 'react'
import { AppstoreAddOutlined, CheckOutlined, CheckSquareOutlined, DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Input, Button, Space, Modal, Form, message, Tooltip, Popconfirm, Spin, Select, DatePicker, ColorPicker, Checkbox} from 'antd'
import Title from 'antd/es/typography/Title';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { createTypeEvent, deleteTypeEvent, getAllTypeEvents, updateTypeEvent } from '../../services/TypeEventService';

dayjs.extend(utc)

const TypeEventComponent = () => {
    
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
    const [idTypeEvent, setIdTypeEvent]             = useState();
    const [cor,         setCor]                     = useState('')
    
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

                    <Tooltip title="Editar">
                        <Button
                            type="primary"
                            shape='circle'
                            className={'rotate-icon'}
                            icon={<EditOutlined rotate={0} />}
                            onClick={() => btnEditar(record)}
                        />
                    </Tooltip>
    {/*                <a>{record.unidade}</a>
                    <a>Delete</a>
    */}         
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
            dataIndex:  "tipoEvento",
            title:      "Tipo do Evento",
            sorter: (a, b) => a.tipoEvento.localeCompare(b.tipoEvento),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('tipoEvento'),
//            onFilter: (value, record) => record.tipoEvento.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            dataIndex:  "calcularDespesa",
            title:      "Despesa",
            sorter: (a, b) => a.calcularDespesa.localeCompare(b.calcularDespesa),
            showSorterTooltip: { target: 'sorter-icon' }, 

            //Renderizar
            render: (calcular, record) => (
                <Checkbox
                    checked={record.calcularDespesa}
                    disabled
                >
                    Calcular
                </Checkbox>
            ),
        },
        {
            dataIndex:  "cor",
            title:      "Cor",
            sorter: (a, b) => a.cor.localeCompare(b.cor),
            showSorterTooltip: { target: 'sorter-icon' }, 

            //Renderizar
            render: (cor, record) => (
                <ColorPicker
                    value={record.cor}
                    disabled
                    />
            ),
        },
    ]

    const gravarDados = (values) => {

        const typeEvent = {
            _id:                values._id,
            tipoEvento:         values.tipoEvento.toUpperCase(),
            cor:                typeof values.cor === 'string' ? values.cor : values.cor.toHexString(),
            calcularDespesa:    values.calcularDespesa

        };

        setLoading(true);    

        if (!values._id) {

            createTypeEvent(typeEvent).then((response) => {
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

            updateTypeEvent(values._id, typeEvent).then((response) => {

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

                const value = await form.validateFields();

                //Prossiga com a acao
                gravarDados(value);

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
        getAllTypeEvents().then((response) => {
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
        setIdTypeEvent();
        if(form) {
            form.resetFields(); //Limpa os campos ao fechar
        }

        setFormModal(true);
    };

    const btnVisualizar = (value) => {

        setIsEditing(false)
        if(value) {

            setIdTypeEvent(value._id)
            form.setFieldsValue({
                _id:                value._id,
                tipoEvento:         value.tipoEvento.toUpperCase(),
                cor:                value.cor,
                calcularDespesa:    value.calcularDespesa

            })

            setFormModal(true);
                
        }
            
    }

    const btnFinalizar = async (value) => {

        setIsPopupFinalizar(true)
/*        
        setLoading(true);    
        await endTypeEvent(value._id).then((response) => {
            message.success('Inventário Finalizado')
            setIsPopupFinalizar(true)            
        }).catch((error)=> {    
            if (error.response.data.message) {
                message.error(error.response.data.message)
            } else {
                if (error.response) {
                    message.error(error.response.data || 'Erro no servidor');
                } else {
                    message.error('Erro ao finalizar!');
                }                
            }
        });
        
        setLoading(false);    
*/
    }

    const btnEditar = (value) => {

        setIsEditing(true);
        setFormModal(true);

        if(value) {

            setIdTypeEvent(value._id)
            form.setFieldsValue({
                _id:                value._id,
                tipoEvento:         value.tipoEvento.toUpperCase(),
                cor:                value.cor,
                calcularDespesa:    value.calcularDespesa
            })

        }

    }

    const btnEliminar = (value) => {

        setIsEditing(false)
        setDeleteModal(true);

        if(value) {

            form.setFieldsValue({
                _id:                value._id,
                tipoEvento:         value.tipoEvento.toUpperCase(),
                cor:                value.cor,
                calcularDespesa:    value.calcularDespesa
            })
        }
    }

    // Chamado se o usuário confirmar na Popconfirm
    const handlePopupConfirm = () => {
        
        if(form.getFieldValue('_id')){

            return deleteTypeEvent(form.getFieldValue('_id')).then((response) => {
                message.success('Registro eliminado com sucesso!')
                form.resetFields(); //Limpa os campos ao fechar
                carregarDados();
                setDeleteModal(false); // Fecha o Modal principal

            }).catch((error)=> {

                if (error.response) {  

                    message.error(error.response.data.message || error.response.data || 'Ocorreu um erro inesperado');
                } else {
                    message.error('Erro ao elimninar');
                }
            });
        }
    };

    // Chamado se o usuário confirmar na Popconfirm
    const handlePopupConfirmFinaliz = (value) => {

        setLoading(true);    

        if(value){

            endTypeEvent(value._id).then((response) => {

                message.success('Registro finalizado com sucesso!')
                form.resetFields(); //Limpa os campos ao fechar
                carregarDados();

            }).catch((error)=> {
                if (error.response.data.message) {
                    message.error(error.response.data.message)
                } else {
                    if (error.response) {
                        message.error(error.response.data || 'Erro no servidor');
                    } else {
                        message.error('Erro ao finalizar!');
                    }                
                }
            });
            
        }

        setLoading(false);
        
    };

    const onChangeColorPicker = (color, hex) => {
        setCor(color.toHexString())     // Exemplo: #d44b4b
    }

  return (
    <div>

        <div style={{ textAlign: 'center' }}>
            <Title level={2}
                style={{ color: 'var(--primary-color)'}}
            >Tipo de Evento</Title>
        </div>

        <Spin 
            spinning={loading} 
            size='large' 
            description="Carregando..."
        >

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
                pagination={false}
    /*            
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
    */                
            />

            {/* Modal de Form */}
            <Modal
                title={ "Manutenção Cadastro Tipo de Evento"}
                open={formModal}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}        
                onOk={handleOk}

            >        
                <Form
                    form={form}
                    layout='vertical'
                    initialValues={{
                        cor: null,
                        calcularDespesa: false,                        
                    }}
                    >
                    <Item
                        name={"_id"}
                        style={{ display: 'none'}}
                    >
                        <Input />
                    </Item>
                    <Item
                        name={"tipoEvento"}
                        label="Tipo de Evento"
                        rules={[{required: true, message: 'Informar Tipo de Evento'}]}
                        >
                        <Input 
                            disabled={!isEditing || idTypeEvent}
                            style={{ textTransform: 'uppercase' }}
                            placeholder='Ex: Trabalho'/>
                    </Item>
                    <Item
                        name={"calcularDespesa"}
                        valuePropName='checked'
//                        label="Calcular Despesa"
                    >
                        <Checkbox>Calcular Despesas</Checkbox>
                    </Item>
                    <Item
                        name={"cor"}
                        label="Cor"
                        rules={[{required: true, message: 'Escolher uma Cor'}]}
                        >
                        
                        <ColorPicker
//                            defaultValue={cor}
                            onChange={onChangeColorPicker}
                        />
                            
                    </Item>
                </Form>

            </Modal>

            <Modal
                title={ "Eliminar Tipo de Evento"}
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
                        description="Ao confirmar o registro será elimado permanentemente."
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
                        name={"tipoEvento"}
                        label="Tipo de Evento"
                        rules={[{required: true, message: 'Informar Tipo de Evento'}]}
                        >
                        <Input 
                            disabled={!isEditing}
                            style={{ textTransform: 'uppercase' }}
                            placeholder='Ex: Trabalho, Folga'/>
                    </Item>
                    <Item
                        name={"calcularDespesa"}
                        label="Calcular Despesa"
                    >
                        <Checkbox
                            disabled={!isEditing}
                        />
                    </Item>
                    <Item
                        name={"cor"}
                        label="Cor"
                        rules={[{required: true, message: 'Escolher uma Cor'}]}
                        >
                        <ColorPicker
                            disabled={!isEditing}
                        />
                    </Item>
                </Form>

            </Modal>

        </Spin>
        
    </div>

  )
}

export default TypeEventComponent