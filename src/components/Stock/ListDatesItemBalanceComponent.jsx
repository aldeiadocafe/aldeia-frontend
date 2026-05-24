import { useEffect, useState } from 'react'
import { Button, Input, Space, Spin, Table, DatePicker, Form, Row, Col, Select } from 'antd'
import { DownloadOutlined, FileSearchOutlined, SearchOutlined } from '@ant-design/icons';

import Title from 'antd/es/typography/Title';

import { getAllDatesItem } from '../../services/DatesItemBalanceService'
import { getAllUnits } from '../../services/UnitService'

import * as XLSX from 'xlsx-js-style'

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { normalizarTexto } from '../../Funcoes/Utils';
import { useAuth } from '../Login/AuthContext';

dayjs.extend(utc)

const { RangePicker } = DatePicker;

const ListDatesItemBalanceComponent = () => {

    const { user } = useAuth()

    const [ form ] = Form.useForm()
    const { Item } = Form

    const [filterEmpresas,  setFilterEmpresas]  = useState([])
    const [selectEmpresas,  setSelectEmpresas]  = useState([]);
    const [empresa,         setEmpresa]         = useState([])

    const [tabela,          setTabela]          = useState(1);
    const [dadosCompleto,   setDadosCompleto]   = useState([])
    const [dados,           setDados]           = useState([])

    const [loading, setLoading]         = useState(false);

    const [searchText, setSearchText]   = useState([])

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 3,
    });

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

    const colunas = [
        {
            dataIndex:  "_id",
            key: 'id',
            sorter: (a, b) => a._id.localeCompare(b._id),
            // Optional: set a default sort order

            //Ocultando coluna
            render: () => null,
            onHeaderCell: () => ({style: { display: 'none'}}),
            onCell: () => ({ style: {display: 'none'}})            
        },        
        {
            title: 'Empresa', 
            dataIndex: 'nomeEmpresa', 
            key: 'empresa',
            filters: filterEmpresas,
            // Método de filtragem
            onFilter: (value, record) => {
//console.log(value)                
                return record.nomeEmpresa.includes(value)
            },
            sorter: (a, b) => a.nomeEmpresa.localeCompare(b.nomeEmpresa),
            showSorterTooltip: { target: 'sorter-icon' }, 
//            ...getColumnSearchProps('nomeEmpresa'),
            ellipsis: true,
        },
        {
            dataIndex:  'itCodigo',
            title: 'Item',
            sorter: (a, b) => a.itCodigo.localeCompare(b.itCodigo),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('itCodigo'),
            ellipsis: true,
        },
        {
            dataIndex:  'descricao',
            title: 'Descrição',
            sorter: (a, b) => a.descricao.localeCompare(b.descricao),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('descricao'),
            defaultSortOrder: 'ascend', 
            ellipsis: true,
        },
        {
            dataIndex:  "unidade",
            title:      "Unid",
            sorter: (a, b) => a.unidade.localeCompare(b.unidade),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('unidade'),
            ellipsis: true,
        },
        {
            dataIndex:  "dataValidade",
            title:      "Dt Valid",
            sorter: (a, b) => new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime(),
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
                const recordDate = dayjs.utc(record.dataValidade);
                return recordDate >= start && recordDate <= end
//                return recordDate.isAfter(start.subtract(1, 'day')) && recordDate.isBefore(end.add(1, 'day'));
            },
            render: (text) => dayjs.utc(text).format('DD/MM/YYYY'),
        },
        {
            dataIndex:  "quantidade",
            title:      "Quantidade",
            align: 'right',
            sorter: (a, b) => a.quantidade - b.quantidade,
            showSorterTooltip: { target: 'sorter-icon' }, 
            render: (value) => formatter.format(value)
        },
    ]
    
    const onChange = (pagination, filters, sorter, extra) => {
//        console.log('params', pagination, filters, sorter, extra);
    };

    const carregarDados = async () => {

        try {

            setLoading(true);

            setEmpresa([])
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

                setEmpresa(user.empresas)

            }

            setDados([])

            let unit
            //Unidade
            await getAllUnits().then((response) => {
                unit = response.data

            })

            await getAllDatesItem().then((response) => {

                const dadosAux = response.data.map(item => ({
                    _id:            item._id,
                    idItem:         item.item._id,
                    itCodigo:       item.item.itCodigo,
                    descricao:      item.item.descricao,
                    quantidade:     item.quantidade,                
                    unit:           item.item.unit,
                    unidade:        (unit.find(unit => unit._id === item.item.unit).unidade),
                    dataValidade:   item.dataValidade,
                    empresa:        item.empresa,
                    nomeEmpresa:    item.empresa.nome
                }))

                setDadosCompleto(dadosAux)
                setDados(dadosAux);

            })

        } catch (error) {
            console.error(error);
        } finally {

            setLoading(false);

        }

    }

    const exportToExcel = () => {

        const headers = ["Empresa", "Item", "Descrição", "Unid", "Data Validade", "Quantidade"];

        const dadosExcel = dados.map(item => ({
            Empresa:        item.nomeEmpresa,
            itCodigo:       item.itCodigo,
            descricao:      item.descricao,
            unidade:        item.unidade,
            dataValidade:   dayjs.utc(item.dataValidade).format('DD/MM/YYYY'),
            quantidade:     formatter.format(item.quantidade)
        }))

        // Cria worksheet / Converte os dados (JSON) em worksheet
        const ws = XLSX.utils.json_to_sheet(dadosExcel)

        // Definir Estilos (Header)
        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4F81BD" } },
            alignment: { horizontal: "center" },
            border: {
                bottom: { style: "thin", color: { rgb: "000000" } }
            }
        }

        // Aplicar estilo aos cabeçalhos (A1, B1, C1)
/*        
        if (ws['A1']) ws['A1'].s = headerStyle
        if (ws['B1']) ws['B1'].s = headerStyle
        if (ws['C1']) ws['C1'].s = headerStyle;
        if (ws['D1']) ws['D1'].s = headerStyle;
        if (ws['E1']) ws['E1'].s = headerStyle;
*/
        for (let i = 0; i < headers.length; i++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: i})   //r = row, c = col
            if (!ws[cellAddress]) continue
            ws[cellAddress].s = headerStyle // '.s' é onde o estilo é aplicado
        }

        // Para atribuir conteudo utilizar .v
        ws['A1'].v = "Empresa"
        ws['B1'].v = "Item"
        ws['C1'].v = "Descrição"
        ws['D1'].v = "Unid"
        ws['E1'].v = "Dt Validade"
        ws['F1'].v = "Quantidade"

        // 3. Ajustar largura das colunas
        ws['!cols'] = [
            { wch: 20 }, // Largura da Coluna A
            { wch: 30 }, // Largura da Coluna B
            { wch: 50 }, // Largura da Coluna C
            { wch: 5  }, // Largura da Coluna D
            { wch: 12 }, // Largura da Coluna E
            { wch: 15 }, // Largura da Coluna F
        ]

        // Cria um novo workbook
        const wb = XLSX.utils.book_new()

        // Adiciona a worksheet ao workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Dados')

        // Gera o arquivo binário e força o download
        XLSX.writeFile(wb, 'Data_Validade.xlsx')

        // 5. Gerar arquivo e baixar
//        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });    
//        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//        saveAs(data, 'data_validade.xlsx');

    }
    
    const handleOnChageEmpresa = async (value) => {

        try {
            
            const dadosAux = dadosCompleto.filter(dados => value.includes(dados.empresa._id))            
            setDados(dadosAux)


        } catch {
            console.log("Erro")
        }
    }

    useEffect(() => {
        carregarDados()
    }, [])

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
                    >Consultar Item por Data de Validade</Title>
                </div>

                <Row gutter={[16, 16]} >

                    <Col span={12}>

                        <Form
                            form={form}
                        >

                            <Item
                                name={"empresas"}
                                key={"empresas"}
                                label={"Selecionar Empresa"}
                                rules={[{required: true, 
                                        message: 'Informar Empresa'}]}
                                >

                                <Select
                                    disabled={empresa.length === 1}
                                    placeholder="Selecionar Empresa"
                                    allowClear  //Permite limpar seleção
                                    mode="multiple"
                                    loading={loading}   // Mostrar ícone de carregamento
                                    options={selectEmpresas}
                                    onChange={handleOnChageEmpresa}
                                />

                            </Item>

                        </Form>

                    </Col>
                    <Col span={12}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end'
                            }}
                        >

                            <Button 
                                type="primary" 
                                icon={<DownloadOutlined />} 
                                onClick={exportToExcel}
                            >
                                Exportar para Excel
                            </Button>                

                        </div>
                    </Col>

                </Row>

                <Table
                    columns={colunas} 
                    dataSource={dados} 
                    showSorterTooltip={true}
                    size={'small'}
                    tableLayout="auto"
                    onChange={onChange} 
                    scroll={{ y: 'calc(80vh - 50px)' }}                
                    rowKey={(record) => record._id}
                    pagination={false}
                />

            </Spin>

        </div>
    )        
}

export default ListDatesItemBalanceComponent