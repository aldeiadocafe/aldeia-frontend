import { useEffect, useState } from 'react'
import { Column } from '@ant-design/plots'
import { Button, Card, Col, Input, Layout, Row, Space, Table, Grid, Form, Select, Spin } from 'antd'
import { Content } from 'antd/es/layout/layout'

import { getAllDatesItem } from '../../services/DatesItemBalanceService'
import { getAllUnits } from '../../services/UnitService'

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { FileSearchOutlined, SearchOutlined } from '@ant-design/icons'
import { getAllStockBalances } from '../../services/StockBalanceService'
import Title from 'antd/es/typography/Title';

import { useAuth } from '../Login/AuthContext';
import { normalizarTexto } from '../../Funcoes/Utils';
import { getAllItems } from '../../services/ItemService'


dayjs.extend(utc)

const { useBreakpoint } = Grid;

const DashComponent = () => {

  const { user } = useAuth();

  const [ datesCompleto,  setDatesCompleto] = useState([])
  const [ datesItem,      setDatesItem]     = useState([])
  const [ loading,        setLoading]       = useState(false)

  const [GComCompleto,    setGComCompleto]    = useState([])
  const [dadosGCom,       setDadosGCom]       = useState([])
  const [searchText,      setSearchText]      = useState('');

  const [selectEmpresas,  setSelectEmpresas]  = useState([]);
  const [empresa,         setEmpresa]         = useState([])

  const [ form ]  = Form.useForm();
  const { Item }  = Form;

  // 1. Nome do array precisa ser data
  const [data, setData] = useState([])

  const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 3,
  });

  const screens = useBreakpoint();

  // Define a altura baseada no breakpoint xs
  // XS < 576px; SM >= 576PX; MD >= 768px; LG >= 992px; XL >= 1200px; XXL >= 1600px
  const gcomHeight = screens.xl ? 130 : 70
  const validadeHeight = screens.xl ? 180 : 100;

  const cardBarra = screens.xl ? '220px' : screens.xs ? '90px' : '100px'
  const plotHeight = screens.xl ? 200 : 90

/*
  Tela do Note
    Largura: 	1234px
    Altura:		642px

  Tablet Saka
    Em pé	>> largura:	601px
             Altura:	780px

    Deitado >> Largura: 	1006px
               Altura: 	427px	

  Celular
    Em pé	>> Largura:	384px
             Altura:	630px

    Deitado >>  Largura:  384px
                Altura:   198 px
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

  const colunas = [
      {
          dataIndex:  'nomeEmpresa',
          key:  'nomeEmpresa',
          title: 'Empresa',
          sorter: (a, b) => a.nomeEmpresa.localeCompare(b.nomeEmpresa),
          showSorterTooltip: { target: 'sorter-icon' }, 
          ...getColumnSearchProps('nomeEmpresa'),
          ellipsis: true,
      },
/*      {
          dataIndex:  'itCodigo',
          key:  'itCodigo',
          title: 'Item',
          sorter: (a, b) => a.itCodigo.localeCompare(b.itCodigo),
          showSorterTooltip: { target: 'sorter-icon' }, 
          ...getColumnSearchProps('itCodigo'),
          ellipsis: true,
      },
*/      {
          dataIndex:  'descricao',
          key:  'descricao',
          title: 'Descrição',
          sorter: (a, b) => a.descricao.localeCompare(b.descricao),
          showSorterTooltip: { target: 'sorter-icon' }, 
          ...getColumnSearchProps('descricao'),
          ellipsis: true,
      },
      {
          dataIndex:  "dataValidade",
          key:        'dataValidade',
          title:      "Dt Valid",
          defaultSortOrder: 'ascend', 
          sorter: (a, b) => new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime(),
          showSorterTooltip: { target: 'sorter-icon' }, 
          ...getColumnSearchProps('dataValidade'),
          render: (text) => dayjs.utc(text).format('DD/MM/YYYY'),
      },
      {
          dataIndex:  "quantidade",
          key:        'quantidade',
          title:      "Quantidade",
          align: 'right',
          sorter: (a, b) => a.quantidade - b.quantidade,
          showSorterTooltip: { target: 'sorter-icon' }, 
          render: (value) => formatter.format(value)
      },
      {
          dataIndex:  "unidade",
          key:        'unidade',
          title:      "Unid",
          sorter: (a, b) => a.unidade.localeCompare(b.unidade),
          showSorterTooltip: { target: 'sorter-icon' }, 
          ...getColumnSearchProps('unidade'),
          ellipsis: true,
      },
  ]

  // Colunas principais
  const colunasGCom = [
    {
        dataIndex:  'nomeEmpresa',
        key:  'nomeEmpresaGCom',
        title: 'Empresa',
        sorter: (a, b) => a.nomeEmpresa.localeCompare(b.nomeEmpresa),
        showSorterTooltip: { target: 'sorter-icon' }, 
        ...getColumnSearchProps('nomeEmpresa'),
        ellipsis: true,
    },
/*    {
        title: 'Item', 
        dataIndex: 'itCodigo', 
        key: 'itCodigoGCom',
        sorter: (a, b) => a.itCodigo.localeCompare(b.itCodigo),
        showSorterTooltip: { target: 'sorter-icon' }, 
        onFilter: (value, record) => record.itCodigo.indexOf(value) === 0,      
        ellipsis: true,
    },
*/    {
        title: 'Descrição', 
        dataIndex: 'descricao', 
        key: 'descricaoGCom',
        sorter: (a, b) => a.descricao.localeCompare(b.descricao),
        defaultSortOrder: 'ascend', 
        showSorterTooltip: { target: 'sorter-icon' }, 
        ...getColumnSearchProps('descricao'),
        ellipsis: true,
    },
    {
        title: 'Qtde', 
        dataIndex: 'quantidade', 
        key: 'quantidadeGCom',
        align: 'right',
        sorter: (a, b) => a.quantidade - b.quantidade,
        showSorterTooltip: { target: 'sorter-icon' }, 
        render: (value) => formatter.format(value),
    },
    {
        title:      "Unid",
        dataIndex:  "unidade",
        key:  "unidadeGCom",
        sorter: (a, b) => a.unidade.localeCompare(b.unidade),
        showSorterTooltip: { target: 'sorter-icon' }, 
        ...getColumnSearchProps('unidade'),
        ellipsis: true,
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
        key: 'diferencaGCom',
        align: 'right',
        sorter: (a, b) => a.diferenca - b.diferenca,
        showSorterTooltip: { target: 'sorter-icon' }, 
        render: (value) => formatter.format(value),
    },
  ];

  const atualizarBarra = async (dados) => {

    const hoje = dayjs(new Date().toISOString().split('T')[0])

    const dataAux = [
      { dias: 'Venc',  total: 0 },
      { dias: '5 dias',    total: 0 },
      { dias: '10 dias',   total: 0 },
      { dias: '15 dias',   total: 0 },
      { dias: '20 dias',   total: 0 },
      { dias: '25 dias',   total: 0 },
      { dias: '30 dias',   total: 0 },
    ];
    
    // Vencidos
    dataAux[0].total = dados
                  .filter(item => (
                    dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day')) <= 0 
                  )
                  .reduce((sum, item) => sum + item.quantidade, 0)

    // 5 dias
    dataAux[1].total = dados
                  .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') > 0)
                  .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') <= 4)
                  .reduce((sum, item) => sum + item.quantidade, 0)

    // 10 dias
    dataAux[2].total = dados
                  .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') > 4)
                  .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') <= 9)
                  .reduce((sum, item) => sum + item.quantidade, 0)

    // 15 dias
    dataAux[3].total = dados
                  .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') > 9)
                  .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') <= 14)
                  .reduce((sum, item) => sum + item.quantidade, 0)

    // 20 dias
    dataAux[4].total = dados
                  .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') > 14)
                  .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') <= 19)
                  .reduce((sum, item) => sum + item.quantidade, 0)

    // 25 dias
    dataAux[5].total = dados
                  .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') > 19)
                  .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') <= 24)
                  .reduce((sum, item) => sum + item.quantidade, 0)

    // 30 dias
    dataAux[6].total = dados
                  .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') > 24)
                  .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') <= 29)
                  .reduce((sum, item) => sum + item.quantidade, 0)

  /*
    dataAux[0].total = 10
    dataAux[1].total = 30
    dataAux[2].total = 25
    dataAux[3].total = 60
    dataAux[4].total = 33
  */

    setData(dataAux)



  }

  // 2. Chart configuration
  const config = {
    data,
    xField: 'dias', // Field for the x-axis
    yField: 'total', // Field for the y-axis
    label: {
      // Configuração de labels nas barras
      style: {
        fill: '#f7f5f5',
      },
    },
    height: plotHeight, // Optional: set a fixed height
    // Opcional: animação ao carregar
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },  
  };

  const handleOnChageEmpresa = async (value) => {

    try {
      
      const GComAux = GComCompleto.filter(dados => value.includes(dados.empresa._id))
      setDadosGCom(GComAux)

      const datesAux = datesCompleto.filter(dados => value.includes(dados.empresa._id))
      setDatesItem(datesAux)
      
      atualizarBarra(datesAux)

    } catch {
      console.log("Erro")
    }
  }

  const heightCardEmpresa = () => {

    if ( screens.sm ) return 'calc(14vh)'
    if ( screens.md ) return 'calc(8vh)'

    return 'calc(8vh)'

  } 

  useEffect(() => {

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

            form.setFieldsValue({ empresas: user.empresas.map(empresa => empresa._id)})

  //          setEmpresa(empresas => user.empresas.map(empresa => empresa._id))
            setEmpresa(user.empresas)

        }
        
        await getAllUnits().then(async (response) => {
         
          const unit = response.data

          await getAllItems().then(async response => {

            const items = response.data

            setGComCompleto([])
            setDadosGCom([])

            let dadosStock

            await getAllStockBalances().then( async response => {

              dadosStock = response.data
                .filter(stock => stock.item != undefined && 
                                 stock.quantidade != 0
                )
                .filter(stock => items.some(item => item._id === stock.item._id))
                .map(item => ({
                  _id:          item._id,
                  idItem:       item.item._id,
                  itCodigo:     item.item.itCodigo,
                  descricao:    item.item.descricao,
                  unidade:      unit ? (unit.find(unit => unit._id === item.item.unit).unidade) : null,
                  quantidade:   item.quantidade,
                  gcomEstoque:  item.gcomEstoque,
                  diferenca:    item.quantidade - item.gcomEstoque,
                  idEmpresa:    item.empresa._id,
                  empresa:      item.empresa,
                  nomeEmpresa:  item.empresa.nome
                }))
                
              setGComCompleto(dadosStock)
              setDadosGCom(dadosStock)

            })

            setDatesCompleto([])
            setDatesItem([])

            const dadosDate = await getAllDatesItem().then(response => response.data)

            if (dadosDate.length > 0) {

              const dados = dadosDate
                                    .filter(dates => dates.item != undefined && 
                                                     dates.quantidade != 0
                                    )
                                    .filter((dates) => dadosStock.some((stock) => stock.idItem     === dates.item._id &&
                                                                                  stock.idEmpresa  === dates.empresa._id))
                                    .map(item => ({
                                          idItem:       item.item._id,          
                                          itCodigo:     item.item.itCodigo,
                                          descricao:    item.item.descricao,
                                          unit:         item.item.unit,
                                          unidade:      (unit.find(unit => unit._id === item.item.unit).unidade),
                                          dataValidade: item.dataValidade,
                                          quantidade:   item.quantidade,
                                          empresa:      item.empresa,
                                          nomeEmpresa:  item.empresa.nome
                                    }))

              if (dados.length > 0) {

                setDatesCompleto(dados)
                setDatesItem(dados)
                
                atualizarBarra(dados)

                setLoading(false); //Libera a tela

              }              

            }

          })

        }).catch((error)=> {
            console.error(error);
        });


      } catch (error) {
          console.error(error);
          
      } /* finally {

        setLoading(false); //Libera a tela

      }
*/
    }

    carregarDados()

  }, [])

  return (
    
    <Spin 
      spinning={loading} 
      size='large' 
      tip="Carregando..."
      >

      <div>
        <Layout >      
          <Content>

            <Card 
              size='small'
              style={{ height: heightCardEmpresa()}}
              >
              <Row gutter={[16, 16]}>
                {(screens.md || screens.sm) &&
                  <Col span={8}>
                    <Title level={4}
                        style={{ color: 'var(--primary-color)'}}
                    >Escolher Empresa</Title>
                  </Col>
                }
                <Col md={12} sm={12} xs={23}>
                  <Form
                      form={form}
                      >
                        <Item
                            name={"empresas"}
                            key={"empresas"}
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
                            >
                            </Select>
                        </Item>
                    </Form>
                </Col>
              </Row>  

            </Card>

            <Row 
              style={{ marginTop: '5px' }}
              gutter={[16, 16]}>

              {/* xs={24} para celular (1 card por linha) */}
              {/* md={12} para desktop (2 cards por linha) */}
              <Col 
                xs={24}
                md={8}
                span={8}
                >
              
                <Card
                  title="Total de Produtos à Vencer"
                  styles={{
                    body:{ 
                        height: cardBarra,                        
                        overflow: 'hidden',
                        padding: 5,
                      },
                  }}
                >            
                  <Column {...config} />
                </Card>

              </Col>

              <Col 
                xs={24}
                md={16}
                span={16}
                >
                <Card
                  title="Aldeia X GCom"                  
                  styles={{
                    body:{ 
                        padding: 5,
                      },
                  }}
                >

                  <Table
                      columns={colunasGCom}
                      dataSource={dadosGCom}      
                      showSorterTooltip={true}
                      size={'small'}
                      tableLayout="auto"
                      scroll={{ y: gcomHeight}}               
                      rowKey={(record) => record._id}
                      pagination={false}
//                      loading={loading}
    /*                  
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
    */                      
                  />

                </Card>
              </Col>

            </Row>

            <Card 
              title="Produtos por Data de Validade" 
              style={{marginTop: '5px'}}
              styles ={{ 
                  body:{ 
                      padding: 5,
                    },
                  }}
              >
              <Table
                  columns={colunas} 
                  dataSource={datesItem} 
                  showSorterTooltip={true}
                  size={'small'}
                  tableLayout="auto"
                  scroll={{ y: validadeHeight }}                
    //              scroll={{ y: 110 }}                
                  rowKey={(record) => record._id}
                  pagination={false}        
//                  loading={loading}

              />

            </Card>
          </Content>
        </Layout>
      </div>

    </Spin>
  )
}

export default DashComponent