import React, { forwardRef, useEffect, useState } from 'react'

import { Table, Input, Space, Button, Form, DatePicker, message, Row, Col, Card, Spin, Tooltip } from 'antd'

import { FileSearchOutlined, IssuesCloseOutlined, SearchOutlined } from '@ant-design/icons';
import Title from 'antd/es/typography/Title';
import { useNavigate } from 'react-router-dom';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { getPlacesInventory } from '../../services/PlacesInventoryService';
import { getAllCompanys } from '../../services/CompanyService';
import { useAuth } from '../Login/AuthContext';
import { normalizarTexto } from '../../Funcoes/Utils';

dayjs.extend(utc)

const ConferenceComponent = () => {    

    const { user } = useAuth();

    const [dados,           setDados]           = useState([]);
    const [searchText,      setSearchText]      = useState('');
    const [SelectedRowKeys, setSelectedRowKeys] = useState();
    const [loading,         setLoading]         = useState(false);

    const [form]    = Form.useForm();
    const { Item }  = Form;

    const navigator = useNavigate()

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

                    <Tooltip title="Contagem">                        
                        <Button
                            type="primary"
                            shape='circle'
                            className={'rotate-icon'}
                            icon={<IssuesCloseOutlined rotate={0} />}
                            onClick={() => btnContagem(record)}
                        />
                    </Tooltip>       

                </Space>
            ),
        },        
        {
            dataIndex:  "nomeEmpresa",
            title:      "Empresa",
            sorter: (a, b) => a.nomeEmpresa.localeCompare(b.nomeEmpresa),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('nomeEmpresa'),
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
            dataIndex:  "local",
            title:      "Localização",
            sorter: (a, b) => a.local.localeCompare(b.local),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('local'),
            ellipsis: true,
        },
        {
            dataIndex:  "situacao",
            title:      "Situação",
            sorter: (a, b) => a.situacao - b.situacao,
            // Optional: set a default sort order
            showSorterTooltip: { target: 'sorter-icon' }, 
            ellipsis: true,
        },
    ]


    const btnPesquisar = async () => {

        const local          = form.getFieldValue('local');

        let processo = '?'

        if(form.getFieldValue('dataInventario')) {

            const dataInventario = dayjs.utc(form.getFieldValue('dataInventario')).format('YYYY-MM-DD')
            processo = processo + 'dataInventario=' + dataInventario

        }

        if(local) {

            if(processo) processo = processo + '&'

            processo = processo + 'local=' + local.toString().toUpperCase()

        }

        setLoading(true);

        try {

            const empresas = await getAllCompanys()

            const places = await getPlacesInventory(processo)

            if (places) {
                
                const ids = user.empresas.map(usuario => usuario._id)

                const dadosAux = places.data
                            .filter(places => places.situacao != 'FINALIZADO')
                            .filter(item => ids.includes(item.inventory.empresa))
                            .map(places => {
                                return {
                                    _id:            places._id,
                                    local:          places.local,
                                    inventory:      places.inventory,
                                    dataInventario: places.inventory.dataInventario,
                                    situacao:       places.situacao,
                                    nomeEmpresa:    (empresas ? empresas.data.find(empresa => empresa._id === places.inventory.empresa).nome : '')
                                }                                
                            })
                setDados(dadosAux);

            }

        }  catch (error) {
            setDados([])            
            message.error(error);
        } finally {
            setTimeout(() => {
            setSelectedRowKeys([]);
            setLoading(false);
            }, 1000);    
        }

    }

    const btnContagem = (record, rowIndex, event) => {

        navigator(`/item-conference/${record._id}`)
//        console.log('Linha clicada:', record);
//        console.log('Índice da linha:', rowIndex);
        // Você pode adicionar sua lógica aqui, como navegação ou abrir um modal
//        alert(`Você clicou na linha de: ${record._id}`);
    };

    useEffect(() => {
        btnPesquisar();
    }, [])

  return (
    <>

        <div>
            
            <Spin 
                spinning={loading} 
                size='large' 
                tip="Carregando..."
                >


                <div style={{ textAlign: 'center' }}>
                    <Title level={2}
                        style={{ color: 'var(--primary-color)'}}
                    >Conferência</Title>
                </div>

                <Card
                    style={{
                        marginBottom: '10px',
                        borderColor: '#c36434',
                        boxShadow: '0 2px 8px #d4b8ab',
                        borderRadius: 8,                    
                    }}
                >

                    <Form
                        name ='frmConferencia'
                        layout='inline'
                        form = {form}
                    >
                        <Row
                            justify={"space-between"}
                            align={"middle"}
                        >

                            <Item
                                name={"_id"}
                                style={{display: 'none'}}
                            >
                                <Input />

                            </Item>
                            <Item
                                name={"dataInventario"}
                                label="Data Inventário"
                                >
                                    <DatePicker 
                                        placeholder='Dt Inventário'
                                        style={{ width: 140 }}
                                        format={{
                                            format: "DD/MM/YYYY",
                                            type: 'mask',
                                        }}
                                    />
                            </Item>
                            <Item
                                name={"local"}
                                label="Localização"
                                >
                                <Col
                                    xs={22}
                                    md={24}
                                    >
                                    <Input 
                                        placeholder='Por exemplo: Estoque'
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                </Col>
                            </Item>
                            <Item>
                                <Button type="primary"
                                    onClick={btnPesquisar}>
                                    Pesquisar
                                </Button>                    
                            </Item>

                        </Row>

                    </Form>

                </Card>

                <Table
                    columns={colunas}
                    dataSource={dados}      
                    showSorterTooltip={true}
                    size={'small'}
                    scroll={{ y: 'calc(80vh - 90px)' }}    
                    rowKey={(record) => record._id}
                    pagination={false}
                    onRow={(record, rowIndex) => {
                        return {
                        onClick: (event) => {
                            btnContagem(record, rowIndex, event);
                        }, // Evento de clique na linha
                        // Outros eventos também podem ser adicionados aqui, como onDoubleClick, onMouseEnter, etc.
                        // onDoubleClick: event => {}, 
                        // onContextMenu: event => {},
                        };
                    }}
                    // Opcional: Adiciona um cursor de mãozinha para indicar que a linha é clicável via CSS
                    rowClassName="clickable-row"             
                />

            </Spin>

        </div>

    </>
  )
}

export default ConferenceComponent