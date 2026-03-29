import { useEffect, useState } from 'react'
import { AppstoreAddOutlined, CheckSquareOutlined, DeleteOutlined, EditOutlined, EyeOutlined, FileSearchOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Input, Button, Space, Modal, Form, message, Tooltip, Popconfirm, Spin, Select, DatePicker, Col, Row} from 'antd'
import Title from 'antd/es/typography/Title';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { createInventory, deleteInventory, endInventory, getAllInventorys, updateInventory } from '../../services/InventoryService';
import { useAuth } from '../Login/AuthContext';
import { normalizarTexto } from '../../Funcoes/Utils';

dayjs.extend(utc)

const InventoryComponent = () => {
    
    const { user } = useAuth();

    const [dados,           setDados]           = useState([]);
    const [selectEmpresas,  setSelectEmpresas]  = useState([]);
    const [empresa,         setEmpresa]         = useState(null)
    const [searchText,      setSearchText]      = useState('');
    const [SelectedRowKeys, setSelectedRowKeys] = useState();

    const [deleteModal,     setDeleteModal]     = useState(false);
    const [formModal,       setFormModal]       = useState(false);
    const [confirmLoading,  setConfirmLoading]  = useState(false);
    const [loading,         setLoading]         = useState(false);
    
    const [form]    = Form.useForm();
    const { Item }  = Form;

    const [isEditing, setIsEditing]                 = useState(true);
    const [idInventory, setIdInventory]             = useState();
    
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
            sorter: (a, b) => a.empresaNome.localeCompare(b.empresaNome),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('empresaNome'),
            ellipsis: true,
        },
        {
            dataIndex:  "dataInventario",
            title:      "Data Inventário",
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
            sorter: (a, b) => a.descricao.localeCompare(b.descricao),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('descricao'),
            ellipsis: true,
        },
        {
            dataIndex:  "tipoInventario",
            title:      "Tipo",
            sorter: (a, b) => a.tipoInventario.localeCompare(b.tipoInventario),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('tipoInventario'),
            ellipsis: true,
        },
        {
            dataIndex:  "situacao",
            title:      "Situação",
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
                await gravarDados(values);

            } catch (errorInfo) {

                message.info('Verificar campo(s)!');
            }

        } else {
            setFormModal(false)
        }
    }

    const carregarDados = async () => {

        setLoading(true);
        setEmpresa(null)

        if (user.empresas) {

            // Empresa
            const formatarDados = user.empresas.map((company) => ({
                value: company._id,
                label: company.nome
            }))
            setSelectEmpresas(formatarDados)

        }
        setDados([])        
        await getAllInventorys().then((response) => {

            const ids = user.empresas.map(usuario => usuario._id)

            const dadosAux = response.data
                .filter(item => ids.includes(item.empresa._id))
                .map(item => ({
                    _id:            item._id,
                    empresa:        item.empresa,
                    empresaNome:    item.empresa?.nome,
                    dataInventario: item.dataInventario,
                    descricao:      item.descricao.toUpperCase(),
                    tipoInventario: item.tipoInventario.toUpperCase(),
                    situacao:       item.situacao.toUpperCase(),

            }))
            setDados(dadosAux);

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
                    message.error(error.response.data || 'Erro no servidor');
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

    </div>

  )
}

export default InventoryComponent