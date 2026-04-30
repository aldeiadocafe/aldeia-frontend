import { useEffect, useState } from 'react';

import { Table, Spin, Input, Space, Button, Row, Col, Select, Form } from 'antd';
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

dayjs.extend(utc)


const ListCriticalItemsComponent = () => {

    const { user } = useAuth();

    const [ form ]  = Form.useForm();
    const { Item }  = Form;

    const [selectEmpresas,  setSelectEmpresas]  = useState([]);
    const [empresa,         setEmpresa]         = useState([])

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
            Empresa:            item.nomeEmpresa,
            Item:               item.itCodigo,
            Descrição:          item.descricao,
            Unid:               item.unidade,
            "Qtde Mínima":      formatter.format(item.quantidadeMinima),
            Quantidade:         formatter.format(item.qtde),
            GCom:               formatter.format(item.gcomEstoque),
            "Mínima - GCOM":    formatter.format(item.diferenca),
            "Data Inventário":  item.dataInventario,
            "Data GCom":        item.dataGCom
        }))

        // Cria worksheet / Converte os dados (JSON) em worksheet
        const ws = XLSX.utils.json_to_sheet(dadosExcel)

/*
        // Fórmulas de multiplicação nas linhas 2 e 3
        ws['D2'] = { t: 'n', f: 'B2*C2' };
        ws['D3'] = { t: 'n', f: 'B3*C3' };
        
        // Fórmula de soma no final
        ws['D4'] = { t: 'n', f: 'SUM(D2:D3)', s: { font: { bold: true } } }; // Com estilo negrito
*/

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
        if (ws['I1']) ws['I1'].s = headerStyle;
        if (ws['J1']) ws['J1'].s = headerStyle;

        // 3. Ajustar largura das colunas
        ws['!cols'] = [
            { wch: 20 }, // Largura da Coluna A
            { wch: 30 }, // Largura da Coluna B
            { wch: 50 }, // Largura da Coluna C
            { wch: 5  }, // Largura da Coluna D
            { wch: 15 }, // Largura da Coluna E
            { wch: 15 }, // Largura da Coluna F
            { wch: 15 }, // Largura da Coluna G
            { wch: 15 }, // Largura da Coluna H
            { wch: 15 }, // Largura da Coluna I
            { wch: 15 }, // Largura da Coluna J
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

            //Formatar em data
            ws['I' + i].z = 'dd/mm/yyyy'
            ws['I' + i].t = 'd' // Define o tipo como Data

            ws['J' + i].z = 'dd/mm/yyyy'
            ws['J' + i].t = 'd' // Define o tipo como Data
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
        sorter: (a, b) => a.nomeEmpresa.localeCompare(b.nomeEmpresa),
        showSorterTooltip: { target: 'sorter-icon' }, 
        ...getColumnSearchProps('nomeEmpresa'),
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
        title: 'Quantidade', 
        dataIndex: 'qtde', 
        key: 'qtde',
        align: 'right',
        sorter: (a, b) => a.qtde - b.qtde,
        showSorterTooltip: { target: 'sorter-icon' }, 
        render: (value) => formatter.format(value),
    },
    {
        title: 'GCom Estoq', 
        dataIndex: 'gcomEstoque', 
        key: 'gcomEstoque',
        align: 'right',
        sorter: (a, b) => a.gcomEstoque - b.gcomEstoque,
        showSorterTooltip: { target: 'sorter-icon' }, 
        render: (value) => formatter.format(value),
    },
    {
        title: 'Mínima - GCom', 
        dataIndex: 'diferenca', 
        key: 'diferenca',
        align: 'right',
        sorter: (a, b) => a.diferenca - b.diferenca,
        showSorterTooltip: { target: 'sorter-icon' }, 
        render: (value) => formatter.format(value),
    },
    {
        dataIndex:  "dataInventario",
        title:      "Dt Inventário",
        sorter: (a, b) => new Date(a.dataInventario).getTime() - new Date(b.dataInventario).getTime(),
        // Optional: set a default sort order
        showSorterTooltip: { target: 'sorter-icon' }, 
        ellipsis: true,
        render: (text) => dayjs.utc(text).format('DD/MM/YYYY'),
    },
    {
        dataIndex:  "dataGCom",
        title:      "Dt GCom",
        sorter: (a, b) => new Date(a.dataGCom).getTime() - new Date(b.dataGCom).getTime(),
        // Optional: set a default sort order
        showSorterTooltip: { target: 'sorter-icon' }, 
        ellipsis: true,
        render: (text) => dayjs.utc(text).format('DD/MM/YYYY'),
    },
  ];

    const carregarDados = async () => {
 
        try {

            setLoading(true);

            const empresasUsuario = user.empresas.map((company) => ({
                    _id:    company._id,
                    nome:   company.nome
                }))

            setEmpresa([])
            if (user.empresas) {

                // Empresa
                const formatarDados = user.empresas.map((company) => ({
                    value: company._id,
                    label: company.nome
                }))
                setSelectEmpresas(formatarDados)

                form.setFieldsValue({ empresas: user.empresas.map(empresa => empresa._id)})

                setEmpresa(user.empresas)

            }

            setDados([])            

            //Unidade
            const unit = await getAllUnits().then((response) => response.data)

            const itemsAux = await getAllItems().then((response) => response.data)
            const items = itemsAux.filter(item => item.quantidadeMinima > 0)

            const stockCompleto = await getAllStockBalances().then(response => response.data)

            let dadosAux = []

            items.map(item => {

                empresasUsuario.map(empresa => {

                    //Caso não encontre o item Stock                
                    const stockAux = stockCompleto.filter ( stock => stock.item._id     === item._id &&
                                                                     stock.empresa._id  === empresa._id
                    )
                    if (stockAux.length === 0) {

                        dadosAux = [...(dadosAux || []), {
                            key:                crypto.randomUUID(),
                            idItem:             item._id,
                            itCodigo:           item.itCodigo,
                            descricao:          item.descricao,
                            qtde:               null, 
                            quantidadeMinima:   item.quantidadeMinima,
                            unit:               item.unit,
                            unidade:            item.unit.descricao,
                            gcomEstoque:        null,
                            diferenca:          item.quantidadeMinima * -1,
                            empresa:            empresa,
                            nomeEmpresa:        empresa.nome,
                        }]  

                    } else {

                        //Verifica se saldo é menor que QuantidadeMinima
                        stockCompleto.filter(stock => stock.empresa._id === empresa._id &&
                                                      stock.item._id === item._id &&
                                                    ( stock.gcomEstoque < item.quantidadeMinima ||
                                                      stock.gcomEstoque === undefined))
                                    .map(stock => {
                                        dadosAux = [...(dadosAux || []), {
                                            key:                crypto.randomUUID(),
                                            idItem:             item._id,
                                            itCodigo:           item.itCodigo,
                                            descricao:          item.descricao,
                                            qtde:               stock.quantidade, 
                                            quantidadeMinima:   item.quantidadeMinima,
                                            unit:               item.unit,
                                            unidade:            item.unit.unidade,
                                            gcomEstoque:        stock.gcomEstoque,
                                            diferenca:          (stock.gcomEstoque ? stock.gcomEstoque : 0)  - item.quantidadeMinima,
                                            dataInventario:     stock.dataInventario,
                                            dataGCom:           stock.dataGCom,
                                            empresa:            stock.empresa,
                                            nomeEmpresa:        stock.empresa.nome,
                                        }]  
                                    })

                    }

                })

            })

            setDadosCompleto(dadosAux);
            setDados(dadosAux);

        } catch (error) {
            console.error(error);
        } finally {

            setLoading(false);

        }
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
                >Consultar Itens Críticos</Title>
            </div>

            <Row gutter={[16, 16]}>

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
                        <Space style={{ marginBottom: 16 }}>
                            <Button 
                                disabled={ dados.length === 0}
                                type="primary" 
                                icon={<DownloadOutlined />} 
                                onClick={exportToExcel}
                            >
                                Exportar para Excel
                            </Button>                
                        </Space>
                    </div>
                </Col>

            </Row>

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
