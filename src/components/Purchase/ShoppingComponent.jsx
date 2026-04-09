import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Form, Checkbox, InputNumber, Space, Typography, Select, Row, Col, DatePicker, message, Spin } from 'antd';
import { SearchOutlined, PlusOutlined, DeleteOutlined, ShoppingCartOutlined, FileSearchOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; // Importa os estilos do Ant Design v5
import { useAuth } from '../Login/AuthContext';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

import { normalizarTexto } from '../../Funcoes/Utils';
import { createShopping, getAllShoppings, updateShopping } from '../../services/ShoppingService';
import { getAllUsers } from '../../services/UserService';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const ShoppingComponent = () => {

    const { user } = useAuth()

    const [form] = Form.useForm();
    const [dados,           setDados]           = useState([]);

    const [loading,         setLoading]         = useState(false);

    const [filterEmpresas,  setFilterEmpresas]  = useState([])
    const [selectEmpresas,  setSelectEmpresas]  = useState([]);
    const [empresa,         setEmpresa]         = useState([])

    const [totalItens,      setTotalItens]      = useState(0)

    const [searchText,      setSearchText]      = useState('');

    const [selectedRowKeys,   setSelectedRowKeys]   = useState([])

    let listarComprado = false

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 3,
    });

    // Função para adicionar item à lista
    const onFinish = (values) => {

        setLoading(true);

        try {

            //Converter array para string
            const nomes = selectEmpresas.filter(empresa => values.empresas.includes(empresa.value))
            const nomesAux = nomes.map(empresa => empresa.label).join(' ')

            const newItem = {
//                key:                Date.now(),
                empresas:           values.empresas,
                nomesEmpresa:       nomesAux,
                itCodigo:           values.itCodigo.toUpperCase(),
                quantidade:         values.quantidade || 1,
                comprado:           false,
                usuarioSolicitacao: user,
                dataSolicitacao:    Date.now(),
                nomeSolicitacao:    user.nome,
            };

            createShopping(newItem).then((response) => {

                message.success('Registro criado com sucesso!')
                setTotalItens(totalItens + 1)

                newItem._id = response.data._id

                setDados([...dados, newItem]);
                form.resetFields(['itCodigo', 'quantidade']); // Limpa o formulário
                
            })

        } catch (error) {

            message.error(error)

        } finally {
            setLoading(false);
        }

    };

    // Função para marcar/desmarcar item como comprado
    const toggleComprado = async (id) => {

        try {

            const linha = dados.find(item => item._id === id)
            if (linha) {
                setTotalItens( !linha.comprado ? totalItens - 1 : totalItens + 1)
            }

            const dadosAux = dados.map((item) =>
                item._id === id ? { ...item, 
                    comprado:       !item.comprado, 
                    usuarioCompra:  user,
                    dataCompra:     Date.now() } : item
                )

            const atualizar = dadosAux.filter(item => item._id === id)
                                      .map((item) => ({
                                        comprado:       item.comprado,
                                        usuarioCompra:  item.usuarioCompra,
                                        dataCompra:     item.dataCompra
                                        }))

            updateShopping(id, atualizar[0]).then((response) => {

                setDados(dadosAux);

            }).catch((error)=> {
                if (error.response) {
                    message.error(error.response.data || 'Erro no servidor');
                } else {
                    message.error('Erro ao criar!');
                }
            });

        } catch (error) {

            if (error.response) {
                message.error(error.response.data || 'Erro no servidor');
            } else {
                message.error('Erro ao criar!');
            }
        }

    };

    // Função para remover item
    const removeItem = (id) => {

        const linha = dados.find(item => item._id === id)
        if (linha) {
            setTotalItens( !linha.comprado ? totalItens - 1 : totalItens + 1)
        }

        const atualizar = dados.filter(item => item._id === id)
                                .map((item) => ({
                                    eliminado:          true,
                                    usuarioEliminacao:  user,
                                    dataEliminacao:     Date.now()
                                }))

        updateShopping(id, atualizar[0]).then((response) => {

            setDados(dados.filter((item) => item._id !== id));

        }).catch((error)=> {
            if (error.response) {
                message.error(error.response.data || 'Erro no servidor');
            } else {
                message.error('Erro ao criar!');
            }
        });
        
    };

/*    
    // 2. Gerar filtros dinâmicos baseados no 'dados'
    // useMemo garante que o cálculo só refaça se 'data' mudar
    const empresasFilters = useMemo(() => {


        const empresas = dados.map(empresa => empresa.nomesEmpresa)

        // Extrai empresas únicas
//        const uniqueEmpresas = [...new Set(dados.map(empresa => empresa.nomesEmpresa))];
/*
        const uniqueEmpresas = dados.filter(
            (nomeEmpresa, index, self) =>
                index === self.findIndex((e) => e.nomeEmpresa === nomeEmpresa.nomeEmpresa)
        );

//        const nomes = uniqueEmpresas.filter(empresa => values.empresas.includes(empresa.value))
//        const nomesAux = nomes.map(empresa => empresa.label + ' ')

        // Formata para o padrão { text: string, value: string }
        return uniqueEmpresas.map(empresa => ({
            text: empresa.join(' '),
            value: empresa.join(' '),
        }))
        
        return (
            {
                text:  'OUTLET  SAKA ',
                value: 'OUTLET  SAKA '
            },
            {
                text:  'OUTLET ',
                value: 'OUTLET '
            }            
        )

    }, [dados]);
*/

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

    // Definição das colunas da tabela
    const colunas = [
        {
            title: 'Comprado',
            dataIndex: 'comprado',           // Pega a propriedade 'name' do dataSource
            key: 'comprado',            // ID único da coluna
            width: '10%',
//            fixed: 'left',  // Fixa a coluna
            // Converte boolean para Number para possibilitar a comparação aritmética
            sorter: (a, b) => Number(a.comprado) - Number(b.comprado),
            showSorterTooltip: { target: 'sorter-icon' }, 
            render: (comprado, record) => (
                <Checkbox
                    checked={comprado}
                    disabled={comprado}
                    onChange={() => toggleComprado(record._id)}
                />
            ),
        },
        {
            dataIndex:  'nomesEmpresa',
            key:  'nomesEmpresa',
            title: 'Empresa',
//            fixed: 'left',  // Fixa a coluna
            filters: filterEmpresas,
            // Método de filtragem
            onFilter: (value, record) => {
//console.log(value)                
                return record.nomesEmpresa.includes(value)
            },
            // Opcional: filtro pesquisável
            //filterSearch: true,
            sorter: (a, b) => a.nomesEmpresa.localeCompare(b.nomesEmpresa),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ellipsis: true,
            render: (text, record) => (
                <span style={{ textDecoration: record.comprado ? 'line-through' : 'none', color: record.comprado ? '#aaa' : '#000' }}>
                    {text}
                </span>
            ),
        },
        {
            title: 'Item',
            dataIndex: 'itCodigo',
            key: 'itCodigo',
//            fixed: 'left',  // Fixa a coluna
            sorter: (a, b) => a.itCodigo.localeCompare(b.itCodigo),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('itCodigo'),
            ellipsis: true,
            render: (text, record) => (
                <span style={{ textDecoration: record.comprado ? 'line-through' : 'none', 
                               color: record.comprado ? '#aaa' : '#000' }}>
                    {text}
                </span>
            ),
        },
        {
            title: 'Estoq Atual',
            dataIndex: 'quantidade',
            key: 'quantidade',
            width: '15%',
            align: 'right',
            sorter: (a, b) => a.quantidade - b.quantidade,
            showSorterTooltip: { target: 'sorter-icon' }, 
            render: (text, record) => (
                <span style={{ textDecoration: record.comprado ? 'line-through' : 'none', color: record.comprado ? '#aaa' : '#000' }}>
                            {text.toLocaleString('pt-BR', { minimumFractionDigits: 2})}
                </span>
            ),
        },
        {
            dataIndex:  "dataSolicitacao",
            title:      "Solicitacao",
            sorter: (a, b) => new Date(a.dataSolicitacao).getTime() - new Date(b.dataSolicitacao).getTime(),
            // Optional: set a default sort order
            showSorterTooltip: { target: 'sorter-icon' }, 
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                <RangePicker
                    value={selectedKeys[0] ? selectedKeys[0] : null}
                    onChange={(dates) => setSelectedKeys(dates ? [dates] : [])}
                    style={{ marginBottom: 8, display: 'block' }}
                    format="DD/MM/YYYY"
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => confirm()} // Aplica o filtro
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                    Filtrar
                    </Button>
                    <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                    Limpar
                    </Button>
                </Space>
                </div>
            ),
            filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            onFilter: (value, record) => {
                
                if (!value || value.length < 2) return true;
                const start = dayjs.utc(value[0]);
                const end = dayjs.utc(value[1]);
                const recordDate = dayjs.utc(record.dataSolicitacao);
                return recordDate >= start && recordDate <= end
//                return recordDate.isAfter(start.subtract(1, 'day')) && recordDate.isBefore(end.add(1, 'day'));
            },
            render: (text, record) => (
                <span style={{ textDecoration: record.comprado ? 'line-through' : 'none', color: record.comprado ? '#aaa' : '#000' }}>
                            {dayjs.utc(text).format('DD/MM/YYYY')}
                </span>
            ),
        },
        {
            dataIndex:  'nomeSolicitacao',
            key:  'nomeSolicitacao',
            title: 'Usuário',
            fixed: 'left',  // Fixa a coluna
            sorter: (a, b) => a.nomeSolicitacao.localeCompare(b.nomeSolicitacao),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('nomeSolicitacao'),
            ellipsis: true,
            render: (text, record) => (
                <span style={{ textDecoration: record.comprado ? 'line-through' : 'none', color: record.comprado ? '#aaa' : '#000' }}>
                    {text}
                </span>
            ),
        },
        {
            dataIndex:  "dataCompra",
            title:      "Compra",
            sorter: (a, b) => new Date(a.dataCompra).getTime() - new Date(b.dataCompra).getTime(),
            // Optional: set a default sort order
            showSorterTooltip: { target: 'sorter-icon' }, 
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                <RangePicker
                    value={selectedKeys[0] ? selectedKeys[0] : null}
                    onChange={(dates) => setSelectedKeys(dates ? [dates] : [])}
                    style={{ marginBottom: 8, display: 'block' }}
                    format="DD/MM/YYYY"
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => confirm()} // Aplica o filtro
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                    Filtrar
                    </Button>
                    <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                    Limpar
                    </Button>
                </Space>
                </div>
            ),
            filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            onFilter: (value, record) => {
                
                if (!value || value.length < 2) return true;
                const start = dayjs.utc(value[0]);
                const end = dayjs.utc(value[1]);
                const recordDate = dayjs.utc(record.dataCompra1);
                return recordDate >= start && recordDate <= end
//                return recordDate.isAfter(start.subtract(1, 'day')) && recordDate.isBefore(end.add(1, 'day'));
            },
            render: (text, record) => (
                <span style={{ textDecoration: record.comprado ? 'line-through' : 'none', color: record.comprado ? '#aaa' : '#000' }}>
                            { text ? dayjs.utc(text).format('DD/MM/YYYY') : ''}
                </span>
            ),
        },
        {
            title: 'Ações',
            key: 'action',
            width: '15%',
            render: (_, record) => (
            <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={record.comprado}
                onClick={() => removeItem(record._id)}
            />
            ),
        },
    ];


    const carregarDados = async () => {
        
        try {

            setLoading(true);
            setDados([])
            setEmpresa(null)

            if (user.empresas) {

                // Empresa
                const formatarDados = user.empresas.map((company) => ({
                    value: company._id,
                    label: company.nome,
                }))
                setSelectEmpresas(formatarDados)

                // Empresa
                const formatarFilter = user.empresas.map((company) => ({
                    value: company.nome,
                    text: company.nome,
                }))
                setFilterEmpresas(formatarFilter)

                setLoading(false)
                form.setFieldsValue({ empresas: user.empresas.map(empresa => empresa._id)})

                setEmpresa(user.empresas)

                const ids = user.empresas.map(usuario => usuario._id)

                const usuariosData = await getAllUsers()
                const usuarios = usuariosData.data

                await getAllShoppings().then(response => {
                    
                    const dadosAux = response.data
                                        .filter(item => !item.eliminado)
                                        .map(shopping => {

                        const empresasAux = shopping.empresas.filter(item => ids.includes(item._id))

                        if (empresasAux.length > 0) {

                            const usuarAux = usuarios.find(usuario => usuario._id === shopping.usuarioSolicitacao._id)

                            return ({
                                _id:                shopping._id,
                                empresas:           shopping.empresas,
                                nomesEmpresa:       empresasAux.map(empresa => empresa.nome).join(' '),
                                itCodigo:           shopping.itCodigo.toUpperCase(),
                                quantidade:         shopping.quantidade,
                                comprado:           shopping.comprado,
                                eliminado:          shopping.eliminado,
                                usuarioSolicitacao: shopping.usuarioSolicitacao,
                                dataSolicitacao:    shopping.dataSolicitacao,
                                nomeSolicitacao:    usuarAux ? usuarAux.nome : ' ',
                                dataCompra:         shopping.dataCompra, // ? shopping.dataCompra : null,
                                usuarioCompra:      shopping.usuarioCompra, // ? shopping.usuarioCompra : null
                            })
                                
                        }

                    })

                    if (dadosAux.filter(item => item !== undefined).length > 0) {

                        const dadosComp = dadosAux.filter(item => item !== undefined)

                        setDados(dadosComp.filter(item => listarComprado === item.comprado))
                        setTotalItens(dadosComp.filter(item => !item.comprado).length)
                    }

                })

            }

        } catch (error) {
            console.error(error);
        } finally {

            setLoading(false);

        }

    }
    
    const handleListarComprado = async (e) => {

        listarComprado = e.target.checked

        await carregarDados()

    }

    useEffect( () => {
        carregarDados()
    }, [])

    return (
        <div style={{ padding: 10 }}>

            <Spin 
                spinning={loading} 
                size='large' 
                tip="Carregando..."
                >

                <Title level={2} style={{ color: 'var(--primary-color)'}}>
                    <ShoppingCartOutlined />Lista de Compras
                </Title>

                {/* Formulário de Inclusão */}
                <Form
                    form={form}
                    layout="inline"
                    onFinish={onFinish}
                    style= {{ width: '100%', display: 'flex'}}
                >

                    <Form.Item                
                        name={"empresas"}
                        key={"empresas"}
                        style={{ flex: '9'}}
                        rules={[{required: true, 
                                message: 'Informar Empresa'}]}
                    >
                        <Select
                            disabled={empresa.length === 1}
                            placeholder="SELECIONAR EMPRESA"
                            allowClear  //Permite limpar seleção
                            mode="multiple"
                            loading={loading}   // Mostrar ícone de carregamento
                            options={selectEmpresas}
                        />
                    </Form.Item>

                    <Form.Item 
                        name="itCodigo" 
                        key={"itCodigo"}
                        style={{ flex: '10'}}
                        rules={[{ required: true, message: 'Digite o item!' }]}
                    >
                        <Input placeholder="Nome do item"
                        style={{ textTransform: 'uppercase' }}/>
                    </Form.Item>

                    <Form.Item 
                        name="quantidade" 
                        key={"quantidade"}
                        style={{ flex: '4'}}
                        rules={[{ required: true, message: 'Qtde Atual Estoq' }]}
                        >                
                        <InputNumber 
                            placeholder="QTDE ATUAL ESTOQ" 
                            decimalSeparator=','
                            min={0} 
                            step={1}
                            style={{ width: '100%'}}
                        />
                    </Form.Item>

                    <Form.Item 
                        style={{ alignContent: 'flex-end'}}
                    >
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            icon={<PlusOutlined />}
                            >
                            Adicionar
                        </Button>
                    </Form.Item>

                    <Form.Item
                        name="chListarComprado"
                        key="chListarComprado"
                        >
                        <Checkbox
                            onChange={handleListarComprado}
                        >
                            Listar Comprado
                        </Checkbox>

                    </Form.Item>
                </Form>

                {/* Tabela de Itens */}
                <Table
                    columns={colunas}
                    dataSource={dados}
                    pagination={false}
    //                rowClassName={(record) => (record.comprado ? 'row-purchased' : '')}
                    
                    style={{marginTop: '5px'}}
                    tableLayout="auto"
                    bordered
                    rowKey={(record) => record._id}
                    scroll={{x: 'max-content',
                            y: 'calc(80vh - 80px)'                
                            }}
                    summary={() => (
                        <Table.Summary.Row>
                            <Table.Summary.Cell colSpan={4}>
                                <Typography.Text strong>Total de itens: {totalItens}</Typography.Text>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    )}
                />

                {/* CSS simples para a linha riscada */}
                <style>{`
                    .row-purchased td {
                    background-color: #fffded;
                    }
                `}</style>

            </Spin>
            
        </div>
    );
};

export default ShoppingComponent;
