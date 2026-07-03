import { useEffect, useRef, useState } from 'react'
import { AppstoreAddOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined, EyeOutlined, FileSearchOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Input, Button, Space, Modal, Form, message, Tooltip, Popconfirm, Spin, Select, InputNumber, Row, Col, AutoComplete} from 'antd'
import Title from 'antd/es/typography/Title';

import { createSafety, deleteSafety, getAllSafetys, updateSafety } from '../../services/SafetyStockService';
import { getAllItems } from '../../services/ItemService';
import { useAuth } from '../Login/AuthContext';
import { normalizarTexto } from '../../Funcoes/Utils';

const SafetyStockComponent = () => {

    const { user } = useAuth();
    
    const [dados,           setDados]           = useState([]);

    const [filterEmpresas,  setFilterEmpresas]  = useState([])
    const [selectEmpresas,  setSelectEmpresas]  = useState([])
    const [dadosEmpresa,    setDadosEmpresa]    = useState([])

    const [dadosItem,       setDadosItem]       = useState([]);
    const [selectItems,     setSelectItems]     = useState([])
    const [dadosDescricao,  setDadosDescricao]  = useState([]);
    const [optDescricao,    setOptDescricao]    = useState([]);    
    const [itemId,          setItemId]          = useState('');


    const [searchText,      setSearchText]      = useState('');
    const [SelectedRowKeys, setSelectedRowKeys] = useState();

    const [deleteModal,     setDeleteModal]     = useState(false);
    const [formModal,       setFormModal]       = useState(false);
    const [confirmLoading,  setConfirmLoading]  = useState(false);
    const [loading,         setLoading]         = useState(false);
    
    const [ form ]  = Form.useForm();
    const { Item }  = Form;

    const [isEditing,   setIsEditing]   = useState(true);
    const [idItem,      setIdItem]      = useState();

    const refDescricao      = useRef(null)
    
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
            title: 'Empresa', 
            dataIndex: 'nomeEmpresa', 
            key: 'empresa',
            filters: filterEmpresas,
            // Método de filtragem
            onFilter: (value, record) => {
//    console.log(value)                
                return record.nomeEmpresa.includes(value)
            },

            sorter: (a, b) => a.nomeEmpresa.localeCompare(b.nomeEmpresa),
            showSorterTooltip: { target: 'sorter-icon' }, 
    //        ...getColumnSearchProps('nomeEmpresa'),
            ellipsis: true,
        },
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
            dataIndex: 'descricao', 
            key: 'descricao',
            sorter: (a, b) => a.descricao.localeCompare(b.descricao),
            defaultSortOrder: 'ascend', 
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('descricao'),
            ellipsis: true,
        },
        {
            title: 'Qde Mínima', 
            dataIndex: 'quantidadeMinima', 
            key: 'quantidadeMinima',
            align: 'right',
            sorter: (a, b) => a.quantidadeMinima - b.quantidadeMinima,
            showSorterTooltip: { target: 'sorter-icon' }, 
            render: (value) => formatter.format(value),
        },
    ]

    // onSearch é acionado quando o usuário digita no input
    const onSearchDescricao = (value) => {

        let res = []
        if (!value) {
            res = []
        } else {

            res = dadosItem
                .filter((item) =>
                    normalizarTexto(item.itCodigo + ' - ' + item.descricao).toUpperCase().includes(normalizarTexto(value).toUpperCase())
                )
                .map((item) => ({
                    // 'value' é o que preenche o input quando selecionado
                    value: item.itCodigo + ' - ' + item.descricao, 
                    // 'label' é o que aparece no dropdown
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.itCodigo} - {item.descricao}</span>
                        </div>
                    ),
                    // Guardamos o id original na opção para uso no onSelect
                    dataId: item?._id, 
                    _idItem: item?._id,
            }));
                
        }

        setOptDescricao(res)

    };

    // onSelect é acionado quando o usuário seleciona uma opção do dropdown
    const onSelectDescricao = (value, option) => {

        setItemId(option._idItem)
        
    }

    //Mostra todas as opções quando o campo é focado
    const onFocusDescricao = () => {        
        setOptDescricao(dadosDescricao)
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

                const valores = await form.validateFields()

                //Prossiga com a acao
                gravarDados(valores);

            } catch (errorInfo) {

                message.info('Verificar campo(s)!');
                console.error('Erro de validação:', errorInfo.errorFields);
            }


        } else {
            setFormModal(false)
        }
    }

    const gravarDados = (values) => {

        const safety = {
            _id:                values._id,
            empresa:            values.empresas,
            item:               itemId,
            quantidadeMinima:   values.quantidadeMinima,
            usuarioCriacao:     user ? user._id : null,
            usuarioAlteracao:   user ? user._id : null,
        };

        setLoading(true);    

        if (!values._id) {

            createSafety(safety).then(async (response) => {
                message.success('Registro criado com sucesso!')
                form.resetFields(); //Limpa os campos ao fechar
                await carregarDados();
                form.setFieldsValue({ empresas: null }) 

            }).catch((error)=> {

                if (error.response) {
                    message.error(error.response.data || 'Erro no servidor');
                } else {
                    message.error('Erro ao criar!');
                }
            });
        } else {

            updateSafety(values._id, safety).then((response) => {

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

    const carregarDados = async () => {

        try {

            setLoading(true);

            setDadosEmpresa([])
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

                form.setFieldsValue({ empresas: user.empresas.map(empresa => empresa._id)})

                setDadosEmpresa(user.empresas)

            }

            //Items
            setDadosItem([])
            await getAllItems().then(async (response) => {

                const dados = response.data
                                .filter( item => item.situacao === 'ATIVO')
                                .map(item => {

                        return {
                            key:        item._id,
                            _idItem:    item._id,
                            itCodigo:   item.itCodigo,
                            unit:       item.unit,
                            unidade:    item.unit?.unidade,
                            value:      item.itCodigo + " - " + item.descricao,
                            label:      item.itCodigo + " - " + item.descricao
                        }
                })

                setDadosDescricao(dados)
                setOptDescricao(dados)

                setDadosItem(response.data)
            })

            setDados([])

            await getAllSafetys().then((response) => {

                // Ler Array
                const dadosAux = response.data.map(safety => ({
                    _id:                safety._id,
                    idEmpresa:          safety.empresa._id,
                    idItem:             safety.item._id,
                    nomeEmpresa:        safety.empresa.nome,
                    itCodigo:           safety.item.itCodigo,
                    descricao:          safety.item.descricao,
                    quantidadeMinima:   safety.quantidadeMinima,
                }))

                setDados(dadosAux);

            });

            setSelectedRowKeys([]);
            setLoading(false);

        } catch (error) {
            console.error(error);
            setLoading(false);
        } finally {    
        }

    }

    useEffect(() => {
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
            setItemId(value.idItem)
            form.setFieldsValue({
                _id:                value._id,
                nomeEmpresa:        value.nomeEmpresa,
                empresas:           value.idEmpresa,
                descricao:          value.itCodigo + ' - ' + value.descricao,
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
                nomeEmpresa:        value.nomeEmpresa,
                empresas:           value.idEmpresa,
                descricao:          value.itCodigo + ' - ' + value.descricao,
                quantidadeMinima:   value.quantidadeMinima
            })
        }
    }

    // Chamado se o usuário confirmar na Popconfirm
    const handlePopupConfirm = async () => {

        if(form.getFieldValue('_id')){

            return await deleteSafety(form.getFieldValue('_id')).then((response) => {

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
            >Estoque de Segurança</Title>
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
                title={ "Manutenção Cadastro Estoque de Segurança"}
                open={formModal}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}        
                onOk={handleOk}

            >        
                <Form
                    form={form}
                    layout='vertical'
                    onsubmit={handleOk}
                    >
                    <Item
                        name="_id"
                        style={{ display: 'none'}}
                    >
                        <Input />
                    </Item>
                    <Item
                        name="empresas"
                        title="Empresas"
                        label="Empresas"
                        rules={[{required: true, 
                                message: 'Informar Empresa'}]}
                        >
                        <Select
//                            prefix="Empresas"
                            disabled={!isEditing || idItem}
//                            dropdownStyle={{ maxHeight: `${limitHeight}px`, overflow: 'auto' }}
                            placeholder="Selecionar Empresa"
//                            mode="multiple"
                            allowClear  //Permite limpar seleção
                            loading={loading}   // Mostrar ícone de carregamento
                            options={selectEmpresas}
                        >
                        </Select>
                    </Item>
                    <Item
                        name = "descricao"
                        label="Descrição"
                        rules={[{required: true, 
                                message: 'Informar Descrição do Item'}]}
                    >
                        <AutoComplete
                            allowClear      // Enable the clear button
//                                value={valueDescricao}    // Controlled component value
                            options={optDescricao}   // // O array de sugestões {value, label}
                            onSelect={onSelectDescricao}
                            onSearch={onSearchDescricao}
                            onFocus={onFocusDescricao}
                            ref={refDescricao}
                            disabled={!isEditing || idItem}

//                                onChange={onChangeDescricao}
                            //onBlur={onBlurDescricao}     // Leave do campo

                            // --- Props de Comportamento ---
                            style={{ minWidth: 260 }}
                            placeholder="Descrição do Item"
//                                allowClear // Mostra ícone para limpar o input
//                                filterOption={false} // Desabilita filtro automático (filtramos no handleSearch)

                            // --- Customização ---
                            notFoundContent="Nenhum resultado encontrado"
                        >
                        </AutoComplete>                        

                    </Item>
                    <Item
                        name="quantidadeMinima"
                        key="quantidadeMinima"
                        label="Qtde Mínima"
                        rules={[{required: true, 
                                 message: 'Informar Quantidade Mínima'}]}
                        >
                        <InputNumber 
                            placeholder='Quantidade mínima de estoque'
                            decimalSeparator=','
                            style={{ width: '50%' }}
                            />
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
                        name="_id"
                        style={{ display: 'none'}}
                    >
                        <Input />
                    </Item>
                    <Item
                        name="empresas"
                        title="Empresas"
                        label="Empresas"
                        rules={[{required: true, 
                                message: 'Informar Empresa'}]}
                        >
                        <Select
//                            prefix="Empresas"
                            disabled={!isEditing}
//                            dropdownStyle={{ maxHeight: `${limitHeight}px`, overflow: 'auto' }}
                            placeholder="Selecionar Empresa"
//                            mode="multiple"
                            allowClear  //Permite limpar seleção
                            loading={loading}   // Mostrar ícone de carregamento
                            options={selectEmpresas}
                        >
                        </Select>
                    </Item>
                    <Item
                        name = "descricao"
                        label="Descrição"
                        required
                        rules={[{required: true, 
                                message: 'Informar Descrição do Item'}]}
                    >
                        <AutoComplete
                            allowClear      // Enable the clear button
//                                value={valueDescricao}    // Controlled component value
                            options={optDescricao}   // // O array de sugestões {value, label}
                            onSelect={onSelectDescricao}
                            onSearch={onSearchDescricao}
                            onFocus={onFocusDescricao}
                            ref={refDescricao}
                            disabled={!isEditing}

//                                onChange={onChangeDescricao}
                            //onBlur={onBlurDescricao}     // Leave do campo

                            // --- Props de Comportamento ---
                            style={{ minWidth: 260 }}
                            placeholder="Descrição do Item"
//                                allowClear // Mostra ícone para limpar o input
//                                filterOption={false} // Desabilita filtro automático (filtramos no handleSearch)

                            // --- Customização ---
                            notFoundContent="Nenhum resultado encontrado"
                        >
                        </AutoComplete>                        

                    </Item>
                    <Item
                        name="quantidadeMinima"
                        key="quantidadeMinima"
                        label="Qtde Mínima"
                        rules={[{required: true, 
                                 message: 'Informar Quantidade Mínima'}]}
                        >
                        <InputNumber 
                            placeholder='Quantidade mínima de estoque'
                            decimalSeparator=','
                            style={{ width: '30%' }}
                            />
                    </Item>

                </Form>

            </Modal>

        </Spin>

    </div>

  )
}

export default SafetyStockComponent