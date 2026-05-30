import { useEffect, useState } from 'react'
import { AppstoreAddOutlined, CheckSquareOutlined, DeleteOutlined, EditOutlined, EyeOutlined, FileSearchOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Input, Button, Space, Modal, Form, message, Tooltip, Popconfirm, Spin, Select, DatePicker, Col, Row, Checkbox} from 'antd'
import Title from 'antd/es/typography/Title';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { createInventory, deleteInventory, endInventory, getAllInventorys, updateInventory } from '../../services/InventoryService';
import { useAuth } from '../Login/AuthContext';
import { normalizarTexto } from '../../Funcoes/Utils';
import { getItemsInventory } from '../../services/ItemInventoryService';
import { getAllUnits } from '../../services/UnitService';
import { getAllDatesItem } from '../../services/DatesItemBalanceService';
import { getAllPlacesInventory } from '../../services/PlacesInventoryService';
import { getAllCountPlaces } from '../../services/CountPlacesService';
import { getAllItems } from '../../services/ItemService';

dayjs.extend(utc)

const InventoryComponent = () => {
    
    const { user } = useAuth();

    const [dados,           setDados]           = useState([]);
    const [filterEmpresas,  setFilterEmpresas]  = useState([])
    const [selectEmpresas,  setSelectEmpresas]  = useState([]);
    const [empresa,         setEmpresa]         = useState(null)
    const [searchText,      setSearchText]      = useState('');
    const [SelectedRowKeys, setSelectedRowKeys] = useState();

    const [expandedItem,    setExpandedItem]    = useState([])
    const [expandedDate,    setExpandedDate]    = useState([])

    // 1. Estado para armazenar as chaves (keys) das linhas expandidas
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);
    const [expandedRowKeysItem, setExpandedRowKeysItem] = useState([]);

    const [deleteModal,     setDeleteModal]     = useState(false);
    const [formModal,       setFormModal]       = useState(false);
    const [confirmLoading,  setConfirmLoading]  = useState(false);
    const [loading,         setLoading]         = useState(false);
    
    const [form]    = Form.useForm();
    const { Item }  = Form;

    const [isEditing, setIsEditing]                 = useState(true);
    const [idInventory, setIdInventory]             = useState();

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 3,
    });

    let listarFinalizado = false

    const { Option, OptGroup } = Select;

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
                            disabled={record.situacao === 'FINALIZADO'}
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
                            disabled={record.situacao === 'FINALIZADO'}
                            onClick={() => btnEliminar(record)}
                        />
                    </Tooltip>       

                </Space>
            ),
        },        
        {
            dataIndex:  "empresaNome",
            key:        "empresaNome",
            title:      "Empresa",
            filters: filterEmpresas,
            // Método de filtragem
            onFilter: (value, record) => {
//console.log(value)                
                return record.empresaNome.includes(value)
            },
            sorter: (a, b) => a.empresaNome.localeCompare(b.empresaNome),
            showSorterTooltip: { target: 'sorter-icon' }, 
//            ...getColumnSearchProps('empresaNome'),
            ellipsis: true,
        },
        {
            dataIndex:  "dataInventario",
            title:      "Data Inventário",
            key:        "dataInventario",
            sorter: (a, b) => new Date(a.dataInventario).getTime() - new Date(b.dataInventario).getTime(),
            // Optional: set a default sort order
            defaultSortOrder: 'descend', 
            showSorterTooltip: { target: 'sorter-icon' }, 
            ellipsis: true,
            render: (text) => dayjs.utc(text).format('DD/MM/YYYY'),

        },
        {
            dataIndex:  "descricao",
            title:      "Descrição",
            key:        "descricao",
            sorter: (a, b) => a.descricao.localeCompare(b.descricao),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('descricao'),
            ellipsis: true,
        },
        {
            dataIndex:  "tipoInventario",
            title:      "Tipo",
            key:        "tipoInventario",
            sorter: (a, b) => a.tipoInventario.localeCompare(b.tipoInventario),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('tipoInventario'),
            ellipsis: true,
        },
        {
            dataIndex:  "situacao",
            title:      "Situação",
            key:        "situacao",
            sorter: (a, b) => a.situacao.localeCompare(b.situacao),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('situacao'),
            ellipsis: true,
        },
        {
            title: 'Finalizar',
            key: 'finalizar',
            width: 130,
            align: 'center',
            render: (_, record) => (
                <Space size="small">

                    <Popconfirm
                        title="Deseja realmente Finalizar o Inventário?"
                        description="Ao confirmar o inventário será considerado como FINALIZADO, não sendo possível reabrir."
                        onConfirm={() =>  handlePopupConfirmFinaliz(record)}
                        okText="Sim"
                        cancelText="Não"            
                    >
                        <Button
                            type="primary"
                            shape='circle'
                            className={'rotate-icon'}
                            icon={<CheckSquareOutlined rotate={0} />}
                            disabled = {record.situacao === 'FINALIZADO'}
                        />
                    </Popconfirm>                    
                </Space>
            ),
        },        
    ]

    const colunasItem = [
        {
            title: 'Item', 
            dataIndex: 'itCodigo', 
            key: 'itCodigo',
            sorter: (a, b) => a.itCodigo.localeCompare(b.itCodigo),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('itCodigo'),
            ellipsis: true,
        },
        {
            title: 'Descrição', 
            dataIndex: 'itemDescricao', 
            key: 'itemDescricao',
            sorter: (a, b) => a.itemDescricao.localeCompare(b.itemDescricao),
            defaultSortOrder: 'ascend', 
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('itemDescricao'),
            ellipsis: true,
        },
        {
            title: 'Unid', 
            dataIndex: 'unidade', 
            key: 'unidade',
            sorter: (a, b) => a.unidade.localeCompare(b.unidade),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('unidade'),
            ellipsis: true,
        },
        {
            title: 'Quantidade',
            dataIndex: 'quantidade',
            key: 'quantidade',
            align: 'right',
            sorter: (a, b) => a.quantidade - b.quantidade,
            showSorterTooltip: { target: 'sorter-icon' }, 
            render: (value) => formatter.format(value),
        },
        {
            title: 'Usuário', 
            dataIndex: 'usuarioNome', 
            key: 'usuarioNome',
            sorter: (a, b) => a.usuarioNome.localeCompare(b.usuarioNome),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('usuarioNome'),
            ellipsis: true,
        },
    ]

    const colunasContagem = [
        {
            dataIndex:  "dataValidade",
            title:      "Dt Validade",
            key:        "dataValidade",
            sorter: (a, b) => new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime(),
            // Optional: set a default sort order
            showSorterTooltip: { target: 'sorter-icon' }, 
            ellipsis: true,
            render: (text) => dayjs.utc(text).format('DD/MM/YYYY'),
            defaultSortOrder: 'ascend', 
        },
        {
            title: 'Quantidade',
            dataIndex: 'countQuantidade',
            key: 'countQuantidade',
            align: 'right',
            sorter: (a, b) => a.countQuantidade - b.countQuantidade,
            showSorterTooltip: { target: 'sorter-icon' }, 
            render: (value) => formatter.format(value),
        },
        {
            title: 'Usuário', 
            dataIndex: 'usuarioNome', 
            key: 'usuarioNome',
            sorter: (a, b) => a.usuarioNome.localeCompare(b.usuarioNome),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('usuarioNome'),
            ellipsis: true,
        },
        {
            dataIndex:  "dataContagem",
            key:        "dataContagem",
            title:      "Dt Contagem",
            sorter: (a, b) => new Date(a.dataContagem).getTime() - new Date(b.dataContagem).getTime(),
            // Optional: set a default sort order
            showSorterTooltip: { target: 'sorter-icon' }, 
            ellipsis: true,
            render: (text) => dayjs.utc(text).format('DD/MM/YYYY'),
        },
    ]

    const gravarDados = async (values) => {

        const inventory = {
            _id:            values._id,
            empresa:        values.empresas,
            dataInventario: dayjs.utc(values.dataInventario),
            descricao:      values.descricao.toUpperCase(),
            tipoInventario: values.tipoInventario.toUpperCase(),
            situacao:       values._id ? values.situacao.toUpperCase() : 'CRIADO',
            usuarioCriacao:     user ? user._id : null,
            usuarioAlteracao:   user ? user._id : null,
        };

        try {

            setLoading(true);    

            if (!values._id) {

                createInventory(inventory).then((response) => {
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

                updateInventory(values._id, inventory).then((response) => {

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
            
        } catch (error) {
            if (error.response) {
                message.error(error.response.data.message || error.response.data || 'Erro no servidor');
            } else {
                message.error('Erro ao criar!');
            }

        } finally {
            setLoading(false)
        }

    }

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
                await gravarDados(values);
                setFormModal(false);


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
            setEmpresa(null)

            if (user.empresas) {

                // Empresa
                const formatarDados = user.empresas.map((company) => ({
                    value: company._id,
                    label: company.nome
                }))
                setSelectEmpresas(formatarDados)

                // Empresa
                const formatarFilter = user.empresas.map((company) => ({
                    value: company.nome,
                    text: company.nome,
                }))
                setFilterEmpresas(formatarFilter)

            }

            const dadosItemsInv = await getItemsInventory().then(response => response.data)
            const dadosPlaces   = await getAllPlacesInventory().then(response => response.data)
            const dadosCount    = await getAllCountPlaces().then(response => response.data)

            setDados([])        
            await getAllInventorys().then( async (response) => {

                const ids = user.empresas.map(usuario => usuario._id)

                const dadosAux = response.data
                    .filter(item => ids.includes(item.empresa._id))
                    .filter(item => (listarFinalizado) ||
                                    (item.situacao.toUpperCase() !== 'FINALIZADO' && !listarFinalizado) )
                    .map(item => ({
                        key:            item._id,
                        _id:            item._id,
                        empresa:        item.empresa,
                        empresaNome:    item.empresa?.nome,
                        dataInventario: item.dataInventario,
                        descricao:      item.descricao.toUpperCase(),
                        tipoInventario: item.tipoInventario.toUpperCase(),
                        situacao:       item.situacao.toUpperCase(),

                }))
                setDados(dadosAux);

                //Unidade
                const unit = await getAllUnits().then( async (response) => response.data)

                const itemsAux = dadosItemsInv
                    .filter(itemsInv => itemsInv.item !== null)
                    .filter(itemsInv => itemsInv.inventory !== null)
                    .filter(itemsInv => dadosAux.some(item => item._id === itemsInv.inventory._id))
                    .map( item => ({
                        key:                item._id,
                        id:                 item._id,
                        inventoryId:        item.inventory._id,
                        itemInventoryId:    item._id,
                        itCodigo:           item.item.itCodigo,
                        itemDescricao:      item.item.descricao,
                        unidade:            item.item.unit ? unit.find(unit => unit._id === item.item.unit).unidade : "",
                        quantidade:         item.quantidade,
                        usuarioNome:        item.usuarioCriacao ? item.usuarioCriacao.nome : '',
                }))

                setExpandedItem(itemsAux)

                const placesAux = dadosPlaces.filter(places => dadosAux.some( item => item._id === places.inventory._id))
                const countAux  = dadosCount
                        .filter(count => count.placesInventory !== null)
                        .filter(count => placesAux.some(places => places._id === count.placesInventory._id))
                        .map( count => {

                            const places = placesAux.find(p => p._id === count.placesInventory._id)

                            return {
                                key:                count._id,
                                id:                 count._id,
                                dataValidade:       count.dataValidade,
                                dataContagem:       count.dataCriacao,
                                usuarioNome:        count.usuarioCriacao ? count.usuarioCriacao.nome : '',
                                countQuantidade:    count.quantidade,
                                inventory:          places ? places.inventory._id: null
                            }                            
                        })

                setExpandedDate(countAux)                        
                
            })

        } catch (error) {
            console.error(error);
        } finally {

            setSelectedRowKeys([]);
            setLoading(false);

        }


    }

    useEffect(() => {
        carregarDados();
    },[]);


    const showFormModal = () => {

        setIsEditing(true);
        setIdInventory();
        setEmpresa(null)
        if(form) {
            form.resetFields(); //Limpa os campos ao fechar

            if (selectEmpresas.length === 1) {
                form.setFieldsValue({ empresas: selectEmpresas[0].value })
                setEmpresa(selectEmpresas[0].value)
            }

        }

        setFormModal(true);
    };

    const btnEditar = (value) => {

        setIsEditing(true);
        setFormModal(true);

        setEmpresa(null)

        if(value) {

            setIdInventory(value._id)
            form.setFieldsValue({
                _id:            value._id,
                dataInventario: dayjs.utc(value.dataInventario),
                descricao:      value.descricao,
                tipoInventario: value.tipoInventario,
                situacao:       value.situacao,
                empresas:       value.empresa._id
            })

            setEmpresa(value.empresa._id)
        }

    }

    const btnEliminar = (value) => {

        setIsEditing(false)
        setDeleteModal(true);

        if(value) {

            form.setFieldsValue({
                _id:            value._id,
                dataInventario: dayjs.utc(value.dataInventario),
                descricao:      value.descricao,
                tipoInventario: value.tipoInventario,
                situacao:       value.situacao
            })
        }
    }

    // Chamado se o usuário confirmar na Popconfirm
    const handlePopupConfirm = () => {
        
        if(form.getFieldValue('_id')){

            deleteInventory(form.getFieldValue('_id')).then((response) => {
                message.success('Registro eliminado com sucesso!')
                form.resetFields(); //Limpa os campos ao fechar
                carregarDados();
                setDeleteModal(false); // Fecha o Modal principal

            }).catch((error)=> {
                
                if (error.response) {
                    message.error(error.response.data.message || error.response.data || 'Erro no servidor');
                } else {
                    message.error('Erro ao criar!');
                }
            });
        }
    };

    // Chamado se o usuário confirmar na Popconfirm
    const handlePopupConfirmFinaliz = async (value) => {

        setLoading(true);    

        if(value){
            
            const inventory = {
                _id:                value._id,
                empresa:            value.empresa,
                empresaNome:        value.empresaNome,
                dataInventario:     value.dataInventario,
                descricao:          value.descricao,
                tipoInventario:     value.tipoInventario,
                situacao:           value.situacao,
                usuarioAlteracao:   user
            }

            await endInventory(inventory).then((response) => {

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

    const handleListarFinalizados = async(e) => {

        listarFinalizado = e.target.checked

        await carregarDados()
    }

    const expandedRowRenderDate = (record) => {

        //Filtrar dados da filha
        const filterItem = expandedDate.filter((item) => 
                item.inventory === record.inventoryId
        )

        return (
            <div style={{ width: '60%',  }}> {/* margin: '0 auto' Container reduzido */}
                <Table 
                    key={"tableItem"}
                    columns={colunasContagem} 
                    dataSource={filterItem} 
                    size={'small'}
                    showSorterTooltip={true}
                    tableLayout='auto'
                    pagination={false}

                    title={() => (
                        <Title level={4}
                            style={{ 
                                color: 'var(--primary-color)',
                                padding: '0px',
                                margin: '0px',
                            }}
                        >
                            Contagem
                        </Title>
                    )} // <--- Título aqui

                />
            </div>
        )

    }

    const expandedRowRenderItem = (record) => {

        //Filtrar dados da filha
        const filterItem = expandedItem.filter((item) => 
                item.inventoryId === record._id 
        )

//bispo
        return (
            <div style={{ width: '60%',  }}> {/* margin: '0 auto' Container reduzido */}
                <Table 
                    key={"tableDate"}
                    columns={colunasItem} 
                    dataSource={filterItem} 
                    size={'small'}
                    showSorterTooltip={true}
                    tableLayout='auto'
                    pagination={false}

                    title={() => (
                        <Title level={4}
                            style={{ 
                                color: 'var(--primary-color)',
                                padding: '0px',
                                margin: '0px',
                            }}
                        >
                            Contagem de Itens
                        </Title>
                    )} // <--- Título aqui

                    expandable={{ 
                        expandedRowRender: expandedRowRenderDate,
                        // 4. Conectar o estado controlado
                        expandedRowKeys: expandedRowKeysItem,
                        // 5. Atualizar o estado quando o usuário clicar manualmente
                        onExpand: (expanded, record) => {

                            const keys = expanded
                            ? [...expandedRowKeysItem, record.key] // Adiciona se expandir
                            : expandedRowKeysItem.filter((key) => key !== record.key); // Remove se fechar

                            setExpandedRowKeysItem(keys);
                        },                
                    }}

                />
            </div>
        )

    }

    // 2. Função para expandir todas as linhas
    const expandAll = async () => {

        setLoading(true)
        const allKeys = dados.map((record) => record.key);
        setExpandedRowKeys(allKeys);
        setLoading(false)

    };

    // 3. Função para recolher todas as linhas
    const collapseAll = async () => {

        setLoading(true)
        setExpandedRowKeys([]);
        setLoading(false)

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
                >Inventário</Title>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>

                <Space>
                    <Button 
                        type='primary'
                        icon={<AppstoreAddOutlined />}
                        onClick={showFormModal}
                        >
                            Cadastrar
                    </Button>

                    <Checkbox
                        onChange={handleListarFinalizados}
                    >
                        Listar Finalizados
                    </Checkbox>
                </Space>
            </div>
                
            <Table
                columns={colunas}
                dataSource={dados}      
                showSorterTooltip={true}
//                tableLayout='auto'
                size={'small'}
                scroll={{ y: 'calc(80vh - 90px)' }}                
                rowKey={(record) => record._id}

                expandable={{ 
                    expandedRowRender: expandedRowRenderItem,
                    // 4. Conectar o estado controlado
                    expandedRowKeys: expandedRowKeys,
                    // 5. Atualizar o estado quando o usuário clicar manualmente
                    onExpand: (expanded, record) => {
                        const keys = expanded
                        ? [...expandedRowKeys, record.key] // Adiciona se expandir
                        : expandedRowKeys.filter((key) => key !== record.key); // Remove se fechar
                        setExpandedRowKeys(keys);
                    },                
                }}


                pagination={false}
            />

            {/* Modal de Form */}
            <Modal
                title={ "Manutenção Cadastro Inventário"}
                open={formModal}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}        
                onOk={handleOk}

            >        
                <Form
                    form={form}
                    layout='vertical'
                    initialValues={{tipoInventario: 'PARCIAL'}}
                    >
                    <Item
                        name={"_id"}
                        style={{ display: 'none'}}
                    >
                        <Input />
                    </Item>
                    <Item
                        name={"situacao"}
                        style={{ display: 'none'}}
                    >
                        <Input />
                    </Item>
                    <Row gutter={[16, 16]}>
                        <Col span={12} >
                            <Item
                                name={"empresas"}
                                key={"empresas"}
                                label={`Empresa`}
                                rules={[{required: true, 
                                        message: 'Informar Empresa'}]}
                                >
                                <Select
                                    disabled={empresa}
                                    placeholder="Selecionar Empresa"
                                    allowClear  //Permite limpar seleção
                                    loading={loading}   // Mostrar ícone de carregamento
                                    options={selectEmpresas}
                                >
                                </Select>
                            </Item>
                        </Col>

                            <Item
                                name="dataInventario"
                                key={"dataInventario"}
                                label="Data Inventário"
                                rules={[{required: true, 
                                        message: 'Informar Data de Inventário'}]}
                                >
                                    <DatePicker
                                        format={"DD/MM/YYYY"}
                                        placeholder='Dt Inventário'
                                        style={{ width: 140 }}
                                        disabled={!isEditing || idInventory}
                                    />
                            </Item>
                        </Row>
                    <Item
                        name={"descricao"}
                        key={"descricao"}
                        label="Descrição"
                        rules={[{required: true, message: 'Informar Descrição'}]}
                        >
                        <Input 
                            disabled={!isEditing}
                            style={{ textTransform: 'uppercase' }}
                            placeholder='Ex: Inventário Loja'/>
                    </Item>
                    <Item 
                        name={"tipoInventario"}
                        key={"tipoInventario"}
                        label="Tipo de Inventário"
                        rules={[{required: true, message: 'Selecionar Tipo'}]}
                        >
                        <Select
                            disabled={!isEditing}
                            placeholder="Selecionar um Tipo"
                            allowClear  //Permite limpar seleção
                        >
                            <Option value="TOTAL">TOTAL</Option>
                            <Option value="PARCIAL">PARCIAL</Option>
                        </Select>
                    </Item>
                </Form>

            </Modal>

            <Modal
                title={ "Eliminar Unidade de Medida"}
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
                        key={"_id"}
                        style={{ display: 'none'}}
                    >
                        <Input />
                    </Item>
                    <Item
                        name={"situacao"}
                        key={"situacao"}
                        style={{ display: 'none'}}
                    >
                        <Input />
                    </Item>
                    <Item 
                        name={"dataInventario"}
                        key={"dataInventario"}
                        label="Data Inventário"
                        >
                            <DatePicker 
                                placeholder='Dt Inventário'
                                style={{ width: 140 }}
                                disabled={!isEditing}
                                format={{
                                    format: "DD/MM/YYYY",
                                    type: 'mask',
                                }}
                            />
                    </Item>
                    <Item
                        name={"descricao"}
                        key={"descricao"}
                        label="Descrição"
                        rules={[{required: true, message: 'Informar Descrição'}]}
                        >
                        <Input 
                            disabled={!isEditing}
                            style={{ textTransform: 'uppercase' }}
                            placeholder='Ex: Estoque, Loja'/>
                    </Item>
                    <Item
                        name={"tipoInventario"}
                        key={"tipoInventario"}
                        label="Tipo"
                        rules={[{required: true, message: 'Selecionar Tipo'}]}
                        >
                        <Select
                            disabled={!isEditing}
                            placeholder="Selecionar um Tipo"
                            allowClear  //Permite limpar seleção
                        >
                            <Option value="TOTAL">TOTAL</Option>
                            <Option value="PARCIAL">PARCIAL</Option>
                        </Select>
                    </Item>
                </Form>

            </Modal>

        </Spin>

    </div>

  )
}

export default InventoryComponent