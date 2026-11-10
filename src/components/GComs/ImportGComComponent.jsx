import { useEffect, useState } from 'react';
import { Table, Input, Space, Upload, message, Spin, Button, Card, Progress, notification, Form, Row, Col, Select } from 'antd';
import { UploadOutlined, SearchOutlined } from '@ant-design/icons';

import * as XLSX from 'xlsx';
import Title from 'antd/es/typography/Title';
import { gcomCreateStockBalance, updateGComEstoque } from '../../services/StockBalanceService';

import { createItemsGCom, getAllItems } from '../../services/ItemService';
import { getAllStockBalances } from '../../services/StockBalanceService';
import { useAuth } from '../Login/AuthContext';
import { getAllUnits } from '../../services/UnitService';
import { AtualizarCustoGCom } from '../../services/UnitCostService';


const ImportGComEstoqueComponent = () => {

  const [messageApi, contextHolder] = message.useMessage();

  const { user } = useAuth();

  const [ form ]  = Form.useForm();
  const { Item }  = Form;

  const [selectEmpresas,      setSelectEmpresas]      = useState([]);
  const [empresas,            setEmpresas]            = useState([])
  const [empresaSelecionada,  setEmpresaSelecionada]  = useState('')

  const [fileList,  setFileList]      = useState([])
  const [arquivo,    setArquivo]      = useState([])
  const [progress,  setProgress]      = useState(0)
  const [loading, setLoading]         = useState(true);
  const [botao,   setBotao]           = useState(false)

  const [exibirTabela,  setExibirTabela]  = useState(false)

  const [dados,       setDados]           = useState([])
  const [datesItem, setDatesItem]         = useState([])
  const [tabela,      setTabela]          = useState(1);
  const [searchText,      setSearchText]  = useState('');

  
  const formatter3Dec = new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
  });

  const formatter2Dec = new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,   
  });

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
                  icon={<SearchOutlined />}
                  size="small"
                  style={{ width: 90 }}
              >
                  Search
              </Button>
              <Button
                  onClick={() => handleReset(clearFilters, confirm)}
                  size="small"
                  style={{ width: 90 }}
              >
                  Reset
              </Button>
          </Space>
      </div>
      ),
      filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => 
      record[dataIndex].toString().toUpperCase().includes(value.toUpperCase()),
  });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        // Note: The actual data filtering happens internally via the 'onFilter' prop, 
        // but you can manage a state here if needed for other components.
    };

  const colunas = [
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
        width: '40%',
        defaultSortOrder: 'ascend', 
        sorter: (a, b) => a.descricao.localeCompare(b.descricao),
        showSorterTooltip: { target: 'sorter-icon' }, 
        ...getColumnSearchProps('descricao'),
        ellipsis: true,
    },
    {
        title: 'GCom Estoq', 
        dataIndex: 'gcomEstoque', 
        key: 'gcomEstoque',
        align: 'right',
        sorter: (a, b) => a.gcomEstoque - b.gcomEstoque,
        showSorterTooltip: { target: 'sorter-icon' }, 
        render: (value) => formatter3Dec.format(value),
    },
    {
        dataIndex:  "custoUnitario",
        title:      "Custo Unitário",
        sorter: (a, b) => a.custoUnitario - b.custoUnitario,
        showSorterTooltip: { target: 'sorter-icon' }, 
        align: 'right',
        render: (value) => formatter2Dec.format(value)
    },

  ];

  const props = {
    name: 'file',
    multiple: false, // Permitir apenas um arquivo    
    fileList, // 1. Limitar os tipos de arquivo (.xls.xlsx)
    accept: 'xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // 2. Validação antes de enviar

    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    headers: {
      authorization: 'authorization-text',
    },

    onChange(info) {

      setFileList(info.fileList.slice(-1)); // Mantém apenas o último arquivo selecionado
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        setArquivo(info.file.originFileObj); // Armazena o arquivo selecionado
        setBotao(true)
//        messageApi.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        messageApi.error(`${info.file.name} file upload failed.`);
      }
    },

    onRemove: () => {
      setBotao(false)
      setFileList([]); // Limpa o estado quando o arquivo é removido
    }

  };


/*
  // Propriedades de configuração do Upload
  const props = {    

    name: 'file', 
    multiple: false, // Permitir apenas um arquivo    
    fileList, // 1. Limitar os tipos de arquivo (.xls.xlsx)
    listType: 'picture',
    accept: 'xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // 2. Validação antes de enviar

    showUploadList: {
      extra: ({ size = 0 }) => (
        <span style={{ color: '#cccccc' }}>({(size / 1024 / 1024).toFixed(2)}MB)</span>
      ),
      showDownloadIcon: true,
      downloadIcon: 'Download',
      showRemoveIcon: true,
    },

    beforeUpload: (file) => {
      const isExcel = 
        file.type === 'application/vnd.ms-excel' || 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
      if (!isExcel) {
        message.error(`${file.name} não é um arquivo Excel válido.`);
        return Upload.LIST_IGNORE; // Remove arquivo inválido da lista
      }

/*      
      const isLt2M = file.size / 1024 / 1024 < 2; // Valida tamanho < 2MB
      if (!isLt2M) {
        message.error('O arquivo deve ser menor que 2MB!');
        return Upload.LIST_IGNORE;
      }
* /
      // Se passou na validação, impede o upload automático (retorna false)
      // e adiciona o arquivo à lista localmente

      setArquivo([file]);
      setFileList([file]);

      
      // Simulação do progresso nativo do Ant Design
      let progress = 0;
      file.status = 'uploading';
      setFileList([{ ...file, percent: 0 }]);

      const interval = setInterval(() => {
        progress += 25;
        if (progress <= 100) {
          setFileList([{ ...file, status: 'uploading', percent: progress }]);
        } else {
          clearInterval(interval);
          setFileList([{ ...file, status: 'done', percent: 100 }]);
          setBotao(true)
          // Executa a importação após o "carregamento" terminar
//          handleExcelImport(file);
        }

      }, 200); // atualiza a cada 200ms para simular a barra subindo

      setExibirTabela(false)

      return false; 

    }, 
    
    onChange(info) {      
      const { status } = info.file;
      if (status !== 'uploading') {
//        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} carregado com sucesso.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} falha no upload.`);
      }
    }, 
    onRemove: () => {
      setBotao(false)
      setFileList([]); // Limpa o estado quando o arquivo é removido
    }
  };
*/
  //Gravar
  const atualizar = async () => {
    
    setBotao(false)
    setExibirTabela(false)
    setProgress(10)

    const reader = new FileReader();

    // Simula progresso de leitura
    reader.onprogress = (event) => {

      if (event.lengthComputable) {
        // Atualiza o progresso com base na leitura do arquivo físico
        const percent = Math.round((event.loaded / event.total) * 50);
        setProgress({ percent });
      }

    };
    
    setLoading(true)

    reader.onload = async (evt) => {

      setProgress(60) // Lendo arquivo concluido

      // 1. Ler o arquivo
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });

      try {

        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // 2. Definir o intervalo (range)
        // Exemplo: Pular as primeiras 3 linhas e ler a partir da 4ª (índice 3)
        // A1-style range pode ser usado: range: "A4:D100"
        // Ou base 0: {s: {r: 3, c: 0}, e: {r: 1000, c: 3}} (Linha 4, Col A até Col D)
        
        const jsonData = XLSX.utils.sheet_to_json(ws, {
          range: 10, // Começa na 11ª linha (pula as primeiras 10)
          header: ["itCodigo", "descricao", "unidade", "quantidade", "estoqueReservado", "estoqueDisponivel", "custoUnitario"]// Opcional: Define nomes de colunas
        });

        if (jsonData.length === 0) {
          message.error('Arquivo Excel está vazio.');
          setLoading(false);
          return;
        }

        const unit  = await getAllUnits().then(response => response.data)
        let items = await getAllItems().then(response => response.data) 

        let dadosStockCompleto = await getAllStockBalances().then(response => response.data)

        let dadosStock = dadosStockCompleto.filter(stock => stock.empresa._id === empresaSelecionada)

        // Carregar itens com quantidade <> 0 e diferente de "Total"
        const itemExcelAux = jsonData.filter(item => (item.quantidade != 0 || item.custoUnitario != 0)
                                              && ! item.itCodigo.toUpperCase().trim().startsWith("TOTAL"))

        setProgress(80) // Planilha convertida para Workbook

        // Array com Descricao Unica
        const uniqueDescricao = new Set()

        const itemExcel = itemExcelAux.filter( item => {
          if (uniqueDescricao.has(item.descricao)) {
            return false
          } else {
            uniqueDescricao.add(item.descricao)
            return true
          }
        })

        //Verificar se todos os itens já estão cadastrados
        const novosItens = itemExcel
                            .filter(excel => !items.some(item => item.itCodigo.trim().toUpperCase() === excel.itCodigo.trim().toUpperCase()))
                            .filter(excel => unit.some(unid => unid.unidade.toUpperCase().trim() === excel.unidade.toUpperCase().trim()))

        if (novosItens.length > 0) {

          const criar = novosItens.map(item => ({
              itCodigo:       item.itCodigo.toUpperCase().trim(),
              descricao:      item.descricao.toUpperCase().trim(),
              unit:           unit.find( u => u.unidade.toString().toUpperCase() === item.unidade.toString().trim().toUpperCase()),
              situacao:       'ATIVO',
              usuarioCriacao: user ? user._id : null,
          }))          

          await createItemsGCom(criar)

          items = await getAllItems().then(response => response.data)

        }

        let unitCost = []
        //Atualizar Custo Unitário dos itens que já existem
        const atualizarCusto = itemExcel
                            .filter(excel => items.some(item => item.itCodigo === excel.itCodigo.toUpperCase().trim()))
                            .map(item => ({ 
                              empresa: empresaSelecionada,
                              item: items.find(items => items.itCodigo === item.itCodigo.toUpperCase().trim())._id,
                              custoUnitario: item.custoUnitario,
                              usuarioAlteracao: user ? user._id : null,
                            }))

        if (atualizarCusto.length > 0) {

          unitCost = await AtualizarCustoGCom(atualizarCusto).then(response => response.data)

        }

        // Criar registro na Stock para os itens que não tem
        let stockCriar = []
        itemExcel
            .filter(excel => items.some(item => item.itCodigo === excel.itCodigo.toUpperCase().trim()))
            .map(item => {

          let criar = false

          // Criar caso nao exista StockBalance / Empresa
          if (! dadosStock.find(stock => stock.item.itCodigo === item.itCodigo.toUpperCase().trim())) {              

            const idItem = items.find(items => items.itCodigo === item.itCodigo.toUpperCase().trim())

            const novoStock = {
              item:         idItem ? idItem._id : null,
              itCodigo:     item.itCodigo.trim().toUpperCase(),
              descricao:    item.descricao.trim().toUpperCase(),
              unidade:      item.unidade,
              gcomEstoque:  item.quantidade,
              empresa:      empresaSelecionada,
            }

            stockCriar.push(novoStock)
          }

        })

        if (stockCriar.length > 0) {

          await gcomCreateStockBalance (stockCriar)

        }

        // Carregar Stock
        dadosStockCompleto = []
        dadosStock = []

        dadosStockCompleto = await getAllStockBalances().then(response => response.data)
        dadosStock = dadosStockCompleto.filter(stock => stock.empresa._id === empresaSelecionada)

        const atualizStock = dadosStock          
                            .filter(stock => itemExcel.some(excel => excel.itCodigo.toUpperCase().trim() === stock.item.itCodigo)
                                              /*&& stock.empresa._id === empresaSelecionada*/)
                            .map(stock => {

                              const gcomEst = itemExcel.find(excel => excel.itCodigo.toUpperCase().trim() === stock.item.itCodigo)

                              return {
                                _id:          stock._id,
                                itCodigo:     stock.item.itCodigo.trim().toUpperCase(),
                                descricao:    stock.item.descricao.trim().toUpperCase(),
                                gcomEstoque:  gcomEst ? gcomEst.quantidade : 0,                                  
                                custoUnitario: unitCost.find(cost => cost.item._id === stock.item._id)?.custoUnitario || 0
                              }
                            })

        if (atualizStock.length > 0 ) {

          updateGComEstoque(atualizStock).then(response => {

            message.success(`Atualizado ${atualizStock.length} linhas com sucesso.`);

            const dadosAux = items.map(item => {

              const stock = dadosStock.find( stock => stock.item._id === item._id)

              if (stock) {

                return {
                  _id:          item._id,
                  itCodigo:     item.itCodigo,
                  descricao:    item.descricao,
                  gcomEstoque:  item.gcomEstoque,
                }
              }

            })

            setDados(atualizStock)              
            setExibirTabela(true)

            setTimeout(() => {
              setProgress(100)              
            }, 3000);
            setFileList([]); // Limpa o estado quando o arquivo é removido

      //      openNotification()
          })

        } else {
          message.error('Nenhuma linha atualizada! Verificar arquivo!');
          setFileList([]); // Limpa o estado quando o arquivo é removido
        }

        // O setTimeout deve envolver APENAS o fechamento do loading
        // para dar tempo do React processar a mudança de estado dos dados
        setTimeout(() => {
          setLoading(false);
        }, 100); // Pequeno delay para garantir a renderização
        
      } catch (error) {

          if (error.response) {
              message.error(error.response.data.message || error.response.data || 'Erro no servidor');
          } else {
              message.error('Erro ao criar!');
          }

      } finally {
          setFileList([]); // Limpa o estado quando o arquivo é removido
          setLoading(false)
      } 

    }

    reader.readAsBinaryString(arquivo);

  }

  const handleOnChangeEmpresa = (value) => {  

//    const emp = empresas.find(emp => emp._id === value);
    setEmpresaSelecionada(value)

  }  

  useEffect( () => {

    const carregarDados = async () => {

      try {

        setLoading(true);

        setEmpresas([])
        setEmpresaSelecionada('')
        if (user.empresas) {

            // Empresa
            const formatarDados = user.empresas.map((company) => ({
                value: company._id,
                label: company.nome
            }))
            setSelectEmpresas(formatarDados)

            form.setFieldsValue({ empresas: user.empresas.map(empresa => empresa._id)})

            setEmpresaSelecionada(user.empresas[0]._id)
            setEmpresas(user.empresas)

        }

        // O setTimeout deve envolver APENAS o fechamento do loading
        // para dar tempo do React processar a mudança de estado dos dados
        setTimeout(() => {
          setLoading(false);
        }, 100); // Pequeno delay para garantir a renderização

        
      } catch (error) {
          console.error(error);
      } finally {

          setLoading(false);

      }

    }

    carregarDados();
            
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
            >Atualizar Quantidade de Estoque GCom</Title>
        </div>
      
          <Card
              size='small'
              style={{
                  marginBottom: '10px',
                  borderColor: '#c36434',
                  boxShadow: '0 2px 8px #d4b8ab',
                  borderRadius: 8,                    
              }}
          >

            <div style={{ width: '70%' }}>

              {user.empresas.length !== 1 && (
              
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
                            placeholder="Selecionar Empresa"
                            loading={loading}         // Mostrar ícone de carregamento
                            options={selectEmpresas}
                            onChange={handleOnChangeEmpresa}
                        />

                    </Item>

                </Form>
              )}

              <div style={{ width: '50%' }}>
                {/*
                  <Upload {...props} fileList={fileList}>
                */}      
                  <Upload {...props}>
                    <Button 
                      disabled={empresas.length === 0}
                      icon={<UploadOutlined />}
                    >Selecionar Excel</Button>
                  </Upload>
              </div>

              {loading && (
                <Card style={{ marginTop: 16 }}>
                  <div style={{ textAlign: 'center' }}>
                    <p>Processando: {progress}%</p>
                    <Progress 
                      percent={progress} 
                      status={progress < 100 ? 'active' : 'success'} />
                  </div>
                </Card>            
              )}

    {/*          {contextHolder} */}

              <Button
                type="primary"
                onClick={atualizar}
                disabled={!botao}
                style={{ marginTop: 16}}
              >
                Atualizar
              </Button>

            </div>

          </Card>

          {exibirTabela && (

            <Card
                size='small'
                style={{
                    marginBottom: '10px',
                    borderColor: '#c36434',
                    boxShadow: '0 2px 8px #d4b8ab',
                    borderRadius: 8,                    
                }}
            >

              <div style={{ textAlign: 'left' }}>
                  <Title level={4}
                      style={{ color: 'var(--primary-color)'}}
                  >GCOM - Quantidades Atualizadas</Title>
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

            </Card>

          )}    

      </Spin>
    </div>
  );

}

export default ImportGComEstoqueComponent