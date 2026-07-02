import { useEffect, useState } from 'react';

import { Table, Spin, Input, Space, Button, Row, Col, Select, Form, InputNumber, Flex } from 'antd';
import { DownloadOutlined, FileSearchOutlined, SearchOutlined } from '@ant-design/icons';
import Title from 'antd/es/typography/Title';


import { getAllStockBalances } from '../../services/StockBalanceService';
import { getAllDatesItem } from '../../services/DatesItemBalanceService';
import { getAllUnits } from '../../services/UnitService'
import { getAllItems } from '../../services/ItemService';

import * as XLSX from 'xlsx-js-style'
import { saveAs } from 'file-saver';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { normalizarTexto } from '../../Funcoes/Utils';
import { useAuth } from '../Login/AuthContext';
import { LuRefreshCcw } from 'react-icons/lu';
import { getAllSafetys } from '../../services/SafetyStockService';

dayjs.extend(utc)


const ListCriticalItemsComponent = () => {

    const { user } = useAuth();

    const [ form ]  = Form.useForm();
    const { Item }  = Form;

    const [filterEmpresas,          setFilterEmpresas]      = useState([])
    const [selectEmpresas,          setSelectEmpresas]      = useState([])
    const [usuarioEmpresas,         setUsuarioEmpresas]     = useState([])
    const [empresasSelecionadas,    setEmpresasSelecionadas]= useState([])

    const [dadosCompleto,   setDadosCompleto]       = useState([])
    const [dados,       setDados]                   = useState([])

    const [searchText,      setSearchText]      = useState([])
    
    const [loading, setLoading] = useState(false);

    const [tabela,      setTabela]      = useState(1);

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 3,
    });

    const exportToExcel = () => {

        const dadosExcel = dados.map(item => ({
            Empresa:                item.nomeEmpresa,
            Item:                   item.itCodigo,
            Descrição:              item.descricao,
            Unid:                   item.unidade,
            "Qtde Mínima":          formatter.format(item.quantidadeMinima),
            "Qtde Estoque":         formatter.format(item.quantidadeEstoque),
            "Vencido / À Vencer":   formatter.format(item.quantidadeAVencer),
            "Qtde Disponível":      formatter.format(item.quantidadeDisponivel),
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

        const rightAlignStyle = {
        alignment: {
            horizontal: 'right', // Opções: 'left', 'center', 'right'
        },
        };

        // Aplicar estilo aos cabeçalhos (A1, B1, C1)
        if (ws['A1']) ws['A1'].s = headerStyle;
        if (ws['B1']) ws['B1'].s = headerStyle;
        if (ws['C1']) ws['C1'].s = headerStyle;
        if (ws['D1']) ws['D1'].s = headerStyle;
        if (ws['E1']) ws['E1'].s = headerStyle;
        if (ws['F1']) ws['F1'].s = headerStyle;
        if (ws['G1']) ws['G1'].s = headerStyle;
        if (ws['H1']) ws['H1'].s = headerStyle;

        // 3. Ajustar largura das colunas
        ws['!cols'] = [
            { wch: 20 }, // Largura da Coluna A
            { wch: 30 }, // Largura da Coluna B
            { wch: 50 }, // Largura da Coluna C
            { wch: 9  }, // Largura da Coluna D
            { wch: 15 }, // Largura da Coluna E
            { wch: 15 }, // Largura da Coluna F
            { wch: 15 }, // Largura da Coluna G
            { wch: 15 }, // Largura da Coluna H
        ]

        // Obtém o total de linhas (exclui o cabeçalho se json_to_sheet for usado sem customização)
        // O !ref contém o intervalo, ex: "A1:B3"
        const range = XLSX.utils.decode_range(ws['!ref']);
//        const totalLinhas = range.e.r - range.s.r; // range.e.r é a última linha (base 0)  >> range.e.r + 1); // +1 para contar a linha do cabeçalho

        // Exemplo para a coluna B2:B10
        for (let i = 2; i <= (range.e.r + 1); i++) {
//            const cellAddress = 'D' + i;
            if (!ws['E' + i]) continue; // Pular se a célula estiver vazia
            ws['E' + i].s = rightAlignStyle; // Aplica o estilo
            ws['F' + i].s = rightAlignStyle; // Aplica o estilo
            ws['G' + i].s = rightAlignStyle; // Aplica o estilo
            ws['H' + i].s = rightAlignStyle; // Aplica o estilo
        }

        // Cria um novo workbook
        const wb = XLSX.utils.book_new()

        // Adiciona a worksheet ao workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Dados')

        // Gera o arquivo binário e força o download
//        XLSX.writeFile(wb, 'TabelaDados.xlsx')

        // 5. Gerar arquivo e baixar
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(data, 'item_critico.xlsx');

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

  // Colunas principais
  const colunas = [
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
//        ...getColumnSearchProps('nomeEmpresa'),
        ellipsis: true,
    },
    {
        title: 'Item', 
        dataIndex: 'itCodigo', 
        key: 'itCodigo',
        sorter: (a, b) => a.itcodigo.localeCompare(b.itcodigo),
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
        title: 'Unid', 
        dataIndex: 'unidade', 
        key: 'unidade',
        sorter: (a, b) => a.unidade.localeCompare(b.unidade),
        showSorterTooltip: { target: 'sorter-icon' }, 
        ...getColumnSearchProps('unidade'),
        ellipsis: true,
    },
    {
        title: 'Qtde Mínima', 
        dataIndex: 'quantidadeMinima', 
        key: 'quantidadeMinima',
        align: 'right',
        sorter: (a, b) => a.quantidadeMinima - b.quantidadeMinima,
        showSorterTooltip: { target: 'sorter-icon' }, 
        render: (value) => formatter.format(value),
    },
    {
        title: 'Qtde Estoque', 
        dataIndex: 'quantidadeEstoque', 
        key: 'quantidadeEstoque',
        align: 'right',
        sorter: (a, b) => a.quantidadeEstoque - b.quantidadeEstoque,
        showSorterTooltip: { target: 'sorter-icon' }, 
        render: (value) => formatter.format(value),
    },
    {
        title: 'Vencido / À Vencer', 
        dataIndex: 'quantidadeAVencer', 
        key: 'quantidadeAVencer',
        align: 'right',
        sorter: (a, b) => a.quantidadeAVencer - b.quantidadeAVencer,
        showSorterTooltip: { target: 'sorter-icon' }, 
        render: (value) => formatter.format(value),
    },
    {
        title: 'Qtde Disponível', 
        dataIndex: 'quantidadeDisponivel', 
        key: 'quantidadeDisponivel',
        align: 'right',
        sorter: (a, b) => a.quantidadeDisponivel - b.quantidadeDisponivel,
        showSorterTooltip: { target: 'sorter-icon' }, 
        render: (value) => formatter.format(value),
    },
  ];

    const handleOnChageEmpresa = async (value) => {

        await setEmpresasSelecionadas(value)

    }

    const carregarItens = async () => {
        setDadosCompleto([])
    }

    const CarregarDadosCompleto = async () => {

        const dias = form.getFieldValue('diasAVencer') || 0
        const hoje = dayjs(new Date().toISOString().split('T')[0])

        try {
            
            setLoading(true);

            //Unidade
            const units = await getAllUnits().then((res) => res.data)

            //Items
            const items = await getAllItems().then((res) => res.data)

            //Safety Stock
            const safetys = await getAllSafetys().then((res) => res.data)
            const safetysEmp = safetys.filter((safety) => empresasSelecionadas.includes(safety.empresa._id))

            //Stock Balance
            const stockBalances = await getAllStockBalances().then((res) => res.data);
            const stockEmp = stockBalances.filter((stock) => empresasSelecionadas.includes(stock.empresa._id))


            //Dates Item Balance
            const datesItemBalance = await getAllDatesItem().then((res) => res.data);
            const datesEmp = datesItemBalance.filter((date) => empresasSelecionadas.includes(date.empresa._id))

            let dadosAux = []

            safetysEmp.map((safety) => {

                stockEmp.filter((stock) => stock.empresa._id === safety.empresa._id 
                                        && stock.item._id === safety.item._id)
                        .map((stock) => {

                    let qtdeAux = 0

                    if (dias > 0) {

                        const datesEmpAux = datesEmp.filter((date) => date.empresa._id === safety.empresa._id
                                                                   && date.item._id === safety.item._id)

                        if (datesEmpAux.length != 0) {

                            qtdeAux = datesEmpAux
                                    .filter(dates => dayjs(new Date(dates.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') <= dias)
                                    .reduce((sum, dates) => sum + dates.quantidade, 0)

                        }
                    } else {

                        const datesEmpAux = datesEmp.filter((date) => date.empresa._id === safety.empresa._id
                                                                   && date.item._id === safety.item._id)

                        if (datesEmpAux.length != 0) {

                            qtdeAux = datesEmpAux
                                    .filter(dates => dayjs(new Date(dates.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') < 0)
                                    .reduce((sum, dates) => sum + dates.quantidade, 0)

                        }

                    }

                    dadosAux = [...(dadosAux || []), {
                        nomeEmpresa:            safety.empresa.nome,
                        itCodigo:               safety.item.itCodigo,       
                        descricao:              safety.item.descricao,
                        unidade:                units.find(unit => unit._id === safety.item.unit)? units.find(unit => unit._id === safety.item.unit).descricao : '',
                        quantidadeMinima:       safety.quantidadeMinima,
                        quantidadeEstoque:      stock.quantidade ? stock.quantidade : 0,
                        quantidadeAVencer:      qtdeAux,
                        quantidadeDisponivel:   stock.quantidade ? stock.quantidade - qtdeAux : 0 - qtdeAux,
                    }]

                })

            })

            setDados(dadosAux.flat().filter((item) => item.quantidadeDisponivel <= item.quantidadeMinima))

            setLoading(false);

        } catch (error) {
            console.error(error);
            setLoading(false);
        }

    }

    const carregarInicial = async () => {

        try {

            setLoading(true);

            const empresasUsuario = user.empresas.map((company) => ({
                    _id:    company._id,
                    nome:   company.nome
                }))

            setUsuarioEmpresas([])
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

                setUsuarioEmpresas(user.empresas)

                setEmpresasSelecionadas(user.empresas.map(empresa => empresa._id))

            }

            setDados([])            

        } catch (error) {
            console.error(error);
        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {
        CarregarDadosCompleto()
    }, [dadosCompleto])

    useEffect(() => {
        carregarInicial()
    }, [])


  return (

    <div>

        <Spin 
        spinning={loading} 
        size='large' 
        description="Carregando..."
        >

            <div style={{ textAlign: 'center' }}>
                <Title level={2}
                    style={{ color: 'var(--primary-color)'}}
                >Consultar Itens Críticos</Title>
            </div>

            <Form
                form={form}
                size='small'
                style={{ marginBottom: '0' }}
                initialValues={{"diasAVencer": 0}}
            >
                <Row gutter={[16, 16]}>

                    <Col span={12}>

                        <Item
                            name={"empresas"}
                            key={"empresas"}
                            label={"Selecionar Empresa"}
                            rules={[{required: true, 
                                    message: 'Informar Empresa'}]}
                            >

                            <Select
                                disabled={usuarioEmpresas.length === 1}
                                placeholder="Selecionar Empresa"
                                allowClear  //Permite limpar seleção
                                mode="multiple"
                                loading={loading}   // Mostrar ícone de carregamento
                                options={selectEmpresas}
                                onChange={handleOnChageEmpresa}
                            />

                        </Item>

                    </Col>     

                    <Col span={12}>
                        <Item
                            name="diasAVencer"
                            key="diasAVencer"
                            label="Dias à Vencer"
                            rules={[{required: true, 
                                        message: 'Informar quantidade de Dias à Vencer'}]}
                            >
                            <InputNumber 
                                placeholder='Dias à Vencer'
                                style={{ width: '40%' }}
                                />
                        </Item>

                    </Col>
                </Row>

            </Form>

            <div style={{ padding: '5px' }}>
                <Flex align="center" gap="small">
                    <Button 
                        type="primary" 
                        icon={<LuRefreshCcw />} 
                        onClick={carregarItens}
                        disabled={empresasSelecionadas.length === 0}
                    >
                        Carregar Itens Críticos
                    </Button>                
                    <span></span>
                    <Button 
                        disabled={ dados.length === 0}
                        type="primary" 
                        icon={<DownloadOutlined />} 
                        onClick={exportToExcel}
                    >
                        Exportar para Excel
                    </Button>                
                </Flex>

            </div>

            <Table
                columns={colunas}
                dataSource={dados}
                size={'small'}
                showSorterTooltip={true}
                tableLayout='auto'
    //            onChange={onChange}
                scroll={{ y: 'calc(80vh - 50px)' }}
                pagination={false}

            />

        </Spin>

    </div>

  );
};

export default ListCriticalItemsComponent;
