import { useEffect, useState } from 'react'
import { AppstoreAddOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined, EyeOutlined, FileSearchOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Input, Button, Space, Modal, Form, message, Tooltip, Popconfirm, Spin, Select, InputNumber, Row, Col, DatePicker} from 'antd'
import Title from 'antd/es/typography/Title';

import { createItem, deleteItem, getAllItems, updateItem } from '../../services/ItemService';
import { getAllUnits } from '../../services/UnitService';
import { useAuth } from '../Login/AuthContext';
import { normalizarTexto } from '../../Funcoes/Utils';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const ItemComponent = () => {

    const { user } = useAuth();

    const [dados,           setDados]           = useState([]);
    const [selectUnits,     setSelectUnits]     = useState([]);
    const [searchText,      setSearchText]      = useState('');
    const [SelectedRowKeys, setSelectedRowKeys] = useState();

    const [deleteModal,     setDeleteModal]     = useState(false);
    const [formModal,       setFormModal]       = useState(false);
    const [confirmLoading,  setConfirmLoading]  = useState(false);
    const [loading,         setLoading]         = useState(true);
    
    const [form]    = Form.useForm();
    const { Item }  = Form;

    const { valorCompra, setValorCompra } = useState(0);

    const [isEditing,   setIsEditing]   = useState(true);
    const [idItem,      setIdItem]      = useState();
    
    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,   
    });

    const { Option, OptGroup } = Select;

    // Formata o número para o padrão pt-BR (ex: 1.234,56)
    const brazilianFormatter = (num) => {
        if (num === undefined || num === null || num === '') return '';
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            }).format(num);
    };

    // Converte a string formatada de volta para número limpo (float)
    const brazilianParser = (str) => {
        if (!str) return '';
            // Remove tudo que não for dígito, vírgula ou sinal de menos
            const cleaned = str.replace(/[^\d,-]/g, '').replace(',', '.');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? '' : parsed;
    };

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
{/*
                    <Tooltip title="Visualizar">
                        <Button
                            type="primary"
                            shape='circle'
                            className={'rotate-icon'}
                            icon={<EyeOutlined rotate={0} />}
                            onClick={() => btnVisualizar(record)}
                        />
                    </Tooltip>       
*/}
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
            width:      '40%',
            sorter: (a, b) => a.descricao.localeCompare(b.descricao),
            defaultSortOrder: 'ascend', 
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('descricao'),
            ellipsis: true,
        },
        {
            dataIndex:  "unitDescricao",
            title:      "Unid Medida",
            sorter: (a, b) => a.unitDescricao.localeCompare(b.unitDescricao),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('unitDescricao'),
            ellipsis: true,
        },
        {
            dataIndex:  "dataCompra",
            title:      "Data Compra",
            sorter: (a, b) => new Date(a.dataCompra).getTime() - new Date(b.dataCompra).getTime(),
            // Optional: set a default sort order
            defaultSortOrder: 'descend', 
            showSorterTooltip: { target: 'sorter-icon' }, 
            ellipsis: true,
            render: (text) => dayjs.utc(text).format('DD/MM/YYYY'),

        },
        {
            dataIndex:  "valorCompra",
            title:      "Valor Compra",
            align: 'right',
            render: (value) => formatter.format(value? value : 0)
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
//            quantidadeMinima:   values.quantidadeMinima,
            dataCompra:         dayjs.utc(values.dataCompra),        
            valorCompra:        values.valorCompra,
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

        // Detecta o tipo de conexão (padrão é 5 segundos, mas vira 15 segundos se for 3G/2G)
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const isSlow = connection && (connection.effectiveType === '2g' || connection.effectiveType === '3g');
        const timeoutDuration = isSlow ? 15000 : 3000; 

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
                    dataCompra:         dayjs.utc(item.dataCompra),        
                    valorCompra:        item.valorCompra,
//                    quantidadeMinima:   item.quantidadeMinima
                }))

                setDados(dadosAux);

                setSelectedRowKeys([]);
//                setLoading(false);

              // O setTimeout deve envolver APENAS o fechamento do loading
              // para dar tempo do React processar a mudança de estado dos dados
              setTimeout(() => {
                setLoading(false);
              }, timeoutDuration); // Pequeno delay para garantir a renderização

            });


        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }

    }

    const carregarSelectUnit = async () => {

//        setLoading(true)

        // Detecta o tipo de conexão (padrão é 5 segundos, mas vira 15 segundos se for 3G/2G)
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const isSlow = connection && (connection.effectiveType === '2g' || connection.effectiveType === '3g');
        const timeoutDuration = isSlow ? 15000 : 3000; 

        try {

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

//        setLoading(false)

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
                dataCompra:         dayjs.utc(value.dataCompra),
                valorCompra:        value.valorCompra,
//                quantidadeMinima:   value.quantidadeMinima
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
                dataCompra:         dayjs.utc(value.dataCompra),
                valorCompra:        value.valorCompra,
//                quantidadeMinima:   value.quantidadeMinima
            })
        }
    }

    // Chamado se o usuário confirmar na Popconfirm
    const handlePopupConfirm = async () => {

        if(form.getFieldValue('_id')){

            return await deleteItem(form.getFieldValue('_id')).then((response) => {

                message.success('Registro eliminado com sucesso!')
                form.resetFields(); //Limpa os campos ao fechar
                carregarDados();
                setDeleteModal(false); // Fecha o Modal principal

            }).catch((error)=> {

                if (error.response) {  

                    message.error(error.response.data.message || error.response.data || 'Ocorreu um erro inesperado');
                } else {
                    message.error('Erro ao eliminar!');
                }
            });
        }

    };


  return (
    <div>

        <div style={{ textAlign: 'center' }}>
            <Title level={2}
                style={{ color: 'var(--primary-color)'}}
            >Item</Title>
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
//                tableLayout='auto'
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
                centered
            >        
                <Form
                    form={form}
                    layout='vertical'
                    initialValues={{situacao: 'ATIVO',
                                    dataCompra: null,
                                    valorCompra: 0,
//                                    quantidadeMinima: 0
                                }}
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
                    </Row>
                    <Row gutter={[16,16]}>
                        <Col span={12}>
                            <Item
                                name="dataCompra"
                                label="Data Compra"
                            >
                            <DatePicker 
                                format={"DD/MM/YYYY"}
                                placeholder='Data Compra'
                                style={{ width: 140 }}
                                disabled={!isEditing}
                            />
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                name="valorCompra"
                                label="Valor Compra"
                            >
                                <InputNumber
                                    prefix="R$"
                                    style={{ width: '100%' }}
                                    step={0.01}                                    
                                    disabled={!isEditing}
                                    value={valorCompra}
                                    formatter={brazilianFormatter}
                                    parser={brazilianParser}
                                    onChange={(val) => setValorCompra(val)}
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
                centered

//                onOk={() => setIsPopupOpen(true)}

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
                    <Row gutter={[16,16]}>
                        <Col span={12}>
                            <Item
                                name="dataCompra"
                                label="Data Compra"
                            >
                            <DatePicker 
                                format={"DD/MM/YYYY"}
                                placeholder='Data Compra'
                                style={{ width: 140 }}
                                disabled={!isEditing}
                            />
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                name="valorCompra"
                                label="Valor Compra"
                            >
                                <InputNumber
                                    prefix="R$"
                                    style={{ width: '100%' }}
                                    step={0.01}                                    
                                    disabled={!isEditing}
                                    value={valorCompra}
                                    formatter={brazilianFormatter}
                                    parser={brazilianParser}
                                    onChange={(val) => setValorCompra(val)}
                                />
                            </Item>
                        </Col>

                    </Row>
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

            </Modal>

        </Spin>

    </div>

  )
}

export default ItemComponent