import { useEffect, useState } from 'react';

import { Table, Spin, Input, Space, Button, Row, Col, Select, Form, Checkbox } from 'antd';
import { DownloadOutlined, FileSearchOutlined, SearchOutlined } from '@ant-design/icons';
import Title from 'antd/es/typography/Title';


import { getAllStockBalances } from '../../services/StockBalanceService';
import { getAllDatesItem } from '../../services/DatesItemBalanceService';
import { getAllUnits } from '../../services/UnitService'

import * as XLSX from 'xlsx-js-style'
import { saveAs } from 'file-saver';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { normalizarTexto } from '../../Funcoes/Utils';
import { useAuth } from '../Login/AuthContext';
import { getAllItems } from '../../services/ItemService';

dayjs.extend(utc)


const ListStockBalanceComponent = () => {

    const { user } = useAuth();

    const [ form ]  = Form.useForm();
    const { Item }  = Form;

    const [filterEmpresas,  setFilterEmpresas]  = useState([])
    const [selectEmpresas,  setSelectEmpresas]  = useState([]);
    const [empresa,         setEmpresa]         = useState([])

    const [dadosCompleto,   setDadosCompleto]       = useState([])
    const [dados,       setDados]                   = useState([])
    const [expandedDateItem, setExpandedDateItem ]  = useState([])

    const [dadosItem,       setDadosItem]           = useState([])
    const [dadosUnit,       setDadosUnit]           = useState([])
    const [dadosStock,      setDadosStock]          = useState([])

    const [searchText,      setSearchText]      = useState([])
    
    const [dadosGCom, setDadosGCom]       = useState([])

    // 1. Estado para armazenar as chaves (keys) das linhas expandidas
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    const [datesItem, setDatesItem]     = useState([])

    const [loading, setLoading] = useState(false);

    const [tabela,      setTabela]      = useState(1);

    const [listar, setListar] = useState(false)

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
            Quantidade:         formatter.format(item.qtde),
            GCom:               formatter.format(item.gcomEstoque),
            "Estoq - GCOM":     formatter.format(item.diferenca),
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

        // 3. Ajustar largura das colunas
        ws['!cols'] = [
            { wch: 15 }, // Largura da Coluna A
            { wch: 10 }, // Largura da Coluna B
            { wch: 45 }, // Largura da Coluna C
            { wch: 5  }, // Largura da Coluna D
            { wch: 15 }, // Largura da Coluna E
            { wch: 15 }, // Largura da Coluna F
            { wch: 15 }, // Largura da Coluna G
            { wch: 15 }, // Largura da Coluna H
            { wch: 15 }, // Largura da Coluna I
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
            ws['H' + i].z = 'dd/mm/yyyy'
            ws['H' + i].t = 'd' // Define o tipo como Data

            ws['I' + i].z = 'dd/mm/yyyy'
            ws['I' + i].t = 'd' // Define o tipo como Data
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
        saveAs(data, 'saldo_item.xlsx');

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
            return record.empresa.nome.includes(value)
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
        title: 'Estoq - GCom', 
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

    // Colunas da sub-tabela
    const expandedColunas = [
        {
            dataIndex:  "dataValidade",
            title:      "Dt Valid",
            sorter: (a, b) => new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime(),
            // Optional: set a default sort order
            showSorterTooltip: { target: 'sorter-icon' }, 
            render: (text) => dayjs.utc(text).format('DD/MM/YYYY'),
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
    ];

      
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

            //Unidade
            setDadosUnit([])
            await getAllUnits().then( async (response) => {

                setDadosUnit(response.data)

            })

            setDadosItem([])
            await getAllItems().then( async (response) => {

                const itemsAux = response.data
                const items = itemsAux.filter(item => item.situacao === "ATIVO")

                setDadosItem(items)

                await getAllDatesItem().then( async (response) => {

                    const dadosDates = response.data
                        .filter(dates => items.some(item => item._id === dates.item._id))
                        .map(item => ({
                            key:            item._id,
                            empresa:        item.empresa,
                            idItem:         item.item._id,
                            dataValidade:   item.dataValidade,
                            quantidade:     item.quantidade,
                        }))

                    setExpandedDateItem(dadosDates);                

                    setDadosGCom([])
                    setDadosStock(await getAllStockBalances().then( async response => response.data))

                })

            }).catch(error => {
                setLoading(false);
            })

        } catch (error) {
            console.error(error);            
        } 
/*        
        finally {

            setLoading(false);

        }
*/            
    }

    const expandedRowRender = (record) => {

        //Filtrar dados da filha
        const filterItem = expandedDateItem.filter((item) => 
                item.idItem === record.idItem &&
                item.empresa._id === record.empresa._id
        )

        return (
            <div style={{ width: '45%',  }}> {/* margin: '0 auto' Container reduzido */}
                <Table 
                    columns={expandedColunas} 
                    dataSource={filterItem} 
                    title={() => (
                        <Title level={4}
                            style={{ 
                                color: 'var(--primary-color)',
                                padding: '0px',
                                margin: '0px',
                            }}
                        >
                            Data de Validade
                        </Title>
                    )} // <--- Título aqui
                    size={'small'}
                    showSorterTooltip={true}
                    tableLayout='auto'
                    pagination={false}
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

    const handleOnChageEmpresa = async (value) => {

        try {

            const dadosAux = dadosCompleto
                                .filter(dados => value.includes(dados.empresa._id))
                                .filter(dados => listar ? true : dados.qtde != undefined)
            setDados(dadosAux)


        } catch {
            console.log("Erro")
        }
    }

    const handleListarItensNaoContados = async (e) => {

        setListar(e.target.checked)

        const empSelecionadas = form.getFieldsValue("empresas")
        const idSelec = empSelecionadas.empresas.map(emp => emp)

        const dadosAux = dadosCompleto
                            .filter(dados => idSelec.includes(dados.empresa._id))
                            .filter(dados => e.target.checked ? true : dados.qtde != undefined)
        setDados(dadosAux)

    }

    useEffect(() => {
        carregarDados()
    }, [])

    useEffect(() => {

        if (dadosStock.length > 0) {

            const dadosAux = dadosStock
                .filter(stock => stock.item != null)
                .map(stock => {

                    if (dadosItem.some(item => item._id === stock.item._id)) {

                        return ({
                            key:            stock._id,                                        
                            idItem:         stock.item._id,
                            itCodigo:       stock.item.itCodigo,
                            descricao:      stock.item.descricao,
                            qtde:           stock.quantidade,                
                            unit:           stock.item.unit,
                            unidade:        (dadosUnit.find(unit => unit._id === stock.item.unit).unidade),
                            gcomEstoque:    stock.gcomEstoque,
                            diferenca:      stock.quantidade - stock.gcomEstoque,
                            dataInventario: stock.dataInventario,
                            dataGCom:       stock.dataGCom,
                            empresa:        stock.empresa,
                            nomeEmpresa:    stock.empresa.nome,
                        })

                    }

                })
            const dadosFinal = dadosAux.filter(dados => dados != undefined)

            setDadosCompleto(dadosFinal);
//            setDados(dadosFinal)
            setDados(dadosFinal.filter(item => item.qtde != undefined));

            setLoading(false);

        }

    }, [dadosStock])

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
                >Consultar Saldo do Item</Title>
            </div>

            <Row gutter={[16, 16]}>

                <Col span={10}>

                    <Form
                        form={form}
                    >

                        <Item
                            name={"empresas"}
                            key={"empresas"}
                            label={"Selecionar"}
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
                            <Button onClick={expandAll}>Expandir</Button>
                            <Button onClick={collapseAll}>Recolher</Button>
                            <Button 
                                type="primary" 
                                icon={<DownloadOutlined />} 
                                onClick={exportToExcel}
                            >
                                Excel
                            </Button>                
                            <Checkbox
                                onChange={handleListarItensNaoContados}
                            >
                                Itens Não Contados
                            </Checkbox>
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
                expandable={{ 
                    expandedRowRender,
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
    /*            
                expandable={{            
                    expandedRowRender: (record) => (
                        <Table 
                            columns={expandedColunas} 
                            dataSource={expandedDateItem} 
                            title={() => 'Data de Validade'} // <--- Título aqui
                            size={'small'}
                            showSorterTooltip={true}
                            tableLayout='auto'
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
                        />
                    ),
                }}
    */
                pagination={false}

            />

        </Spin>

    </div>

  );
};

export default ListStockBalanceComponent;
