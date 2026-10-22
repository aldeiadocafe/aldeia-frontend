import { useEffect, useState } from 'react'
import { Form, Calendar, Modal, Button, DatePicker, Badge, Spin, Row, Col, Select, Typography, Tooltip, Radio, Flex, Popconfirm, message, Splitter, Tree, Card } from 'antd';
import { PrinterOutlined, ScheduleOutlined } from '@ant-design/icons';

import Title from 'antd/es/typography/Title';

import { useAuth } from '../Login/AuthContext';
import { normalizarTexto } from '../../Funcoes/Utils';

import dayjs from 'dayjs';

import './Schedule.css';
import { getAllUsers } from '../../services/UserService';
import { getAllTypeEvents } from '../../services/TypeEventService';
import { getAllVersionSchedules } from '../../services/VersionScheduleService';
import { activateDraft } from '../../services/DraftScheduleService';

const { Text } = Typography;

const VersionScheduleComponent = () => {
    
    const [messageApi, contextHolder] = message.useMessage();
    const { user } = useAuth();

    const [empresa,         setEmpresa]       = useState([])
    const [optionEmpresas,  setOptionEmpresas]= useState([])
    const [selectEmpresas,  setSelectEmpresas]= useState([])

    const [typeEvent, setTypeEvent] = useState([])

    const [colaboradores,     setColaboradores]   = useState([])
    const [listarColab,       setListarColab]     = useState([])
    const [optColaboradores, setOptColaboradores] = useState([])

    const [loading, setLoading] = useState(false);

    const [versions,        setVersions]    = useState([]);
    const [versaoSelec,     setVersaoSelec] = useState([])
    const [eventos,         setEventos ]    = useState([])          


    // Estado para armazenar o recurso selecionado no filtro
    const [opcaoColaboradoresFiltro,  setopcaoColaboradoresFiltro]  = useState([])
    const [filterResource,            setFilterResource]            = useState(['ALL']);

    const [modalReativacao, setModalReativacao] = useState(false)
    
    const [form]    = Form.useForm();

    const handleOkVersion = async () => {      

      setModalReativacao(true)

    }

    // Renderiza o Badge no calendário caso a data esteja dentro do intervalo
    const cellRender = (currentDate) => {

        // Busca a data Inicial e Final do evento no estado
        const listData = eventos
          .filter((event) => {
            /*      
                return currentDate.isAfter(event.start.subtract(1, 'day')) && 
                        currentDate.isBefore(event.end.add(1, 'day'));
 
                return currentDate.isAfter(event.start) && 
                        currentDate.isBefore(event.end);
            */                       
                return currentDate.isAfter(event.start) && 
                        currentDate.isBefore(event.end);

          })          
//          .filter(event => filterResource === 'all' || event.userID === filterResource)
          .filter(event => filterResource.some(resource => resource === 'ALL') || 
                           filterResource.some(resource => resource === event.userID))
          .filter(event => selectEmpresas.some(emp => emp === event.empresaID))

        return (
            <ul style={{ listStyle: 'none', 
                         padding: 0, margin: 0,}}
                className="events"
            >
                
                {listData.map((item, index) => (
                    <li key={item.id} style={{ marginBottom: '0' }}>
                        <span
                            onClick={(e) => abrirConfirmacaoDelecao(e, item)}
                            style={{ cursor: 'pointer', display: 'block' }}
                        >                
                            {/* Div customizada para servir de container com o background desejado */}
                            <div style={{ 
                                backgroundColor: item.color,
                                borderRadius: '4px', 
                                overflow: 'hidden',
                                margin: '1px'
                            }}>
                                <Badge
                                    status={item.type} 
                                    color={item.color}
//                                    text={item.content}
                                >
                                  <span style={{ padding: '5px', cursor: 'pointer' }}>
                                    <Text 
                                      style={{ 
                                        maxWidth: 100,
                                        color: '#ffffff',
                                      }} // Define o limite de largura para o texto
                                      ellipsis={true}
                              //        ellipsis={{ tooltip: { title: item.content } }} // Ativa as reticências e o tooltip opcional
                                    >
                                      { item.content }
                                    </Text>
                                  </span>
                                </Badge>
                            </div>
                        </span>
                    </li>

                ))}
            </ul>
        );

    };

    const handleChangeEmpresa = (values) => {

      const colabEmp = []

      for (const colab of colaboradores) {

        const dadosAux = colab.empresas.find(emp => values.includes(emp._id))

        if (dadosAux) {
          colabEmp.push(colab)

        }

      }

      setopcaoColaboradoresFiltro([{ label: 'Todos os Colaboradores', value: 'ALL' }, ...colabEmp])
      setSelectEmpresas(values)

    }

    const headerRender = ({ value, type, onChange, onTypeChange }) => {

        const current   = value.clone();
        const year      = current.year();
        const month     = current.month();

        // Gerar opções de anos (ex: 10 anos antes e depois)
        const yearOptions = [];        
        for (let i = year - 10; i < year + 10; i += 1) {
            yearOptions.push(<Select.Option key={i} value={i}>{i}</Select.Option>);
        }

        // Gerar as opções de meses
        const monthOptions = [];
/*        
        for (let i = 0; i < 12; i += 1) {
            monthOptions.push(<Select.Option key={i} value={i}>{i + 1}M</Select.Option>);
        }
*/
        for (let i = 0; i < 12; i++) {
            // Cria uma data para cada mês e formata com o nome completo
            const monthName = dayjs().month(i).format('MMMM'); 
            
            monthOptions.push(
                <Select.Option 
                    key={i} 
                    value={i}
                    style={{ width: 'auto' }}
                    >
                    {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                </Select.Option>
            );
        }

        // Função para jogar o calendário para a data atual (Hoje)
        const handleTodayClick = () => {
            onChange(dayjs());
        };        

        return (

            <Row 
                justify="end" 
                style={{ padding: '8px'}}
                >

                <Col>
                    <Row gutter={8}>                      
                        <Col>
                          <Select
                            className="ocultar-objetos"
                            size="small"
                            title="Selecionar Empresa"
                            placeholder="Selecionar Empresa"
                            style={{ width: 450 }}
                            disabled={empresa.length === 1}
//                            allowClear  //Permite limpar seleção
                            mode="multiple"
                            loading={loading}   // Mostrar ícone de carregamento
                            options={optionEmpresas}
                            value={selectEmpresas}
                            onChange={handleChangeEmpresa}
                            />
                        </Col>
                        <Col>
                          <Select
                            className="ocultar-objetos"
                            size="small"
                            title="Selecionar Colaborador"
                            placeholder="Selecionar Colaborador"
                            defaultValue="ALL"
                            style={{ width: 250 }}
                            mode="multiple"
                            options={opcaoColaboradoresFiltro}
                            onChange={(value) => setFilterResource(value)}
                          />                        
                        </Col>
                        <Col className="ocultar-objetos">
                            {/* Botão Hoje posicionado ao lado dos seletores */}
                            <Button 
                                size="small" 
                                type="primary" 
                                onClick={handleTodayClick}
                            >
                                Hoje
                            </Button>
                        </Col>
                        <Col>
                            <Select
                                size="small"
                                value={month}
                                onChange={(newMonth) => onChange(current.month(newMonth))}
                                // Define um estilo base flexível para o componente
                                style={{ minWidth: 110, width: 'auto' }}                                 
                            >
                                {monthOptions}
                            </Select>
                        </Col>
                        <Col>
                            <Select
                                size="small"
                                value={year}
                                onChange={(newYear) => onChange(current.year(newYear))}
                            >
                                {yearOptions}
                            </Select>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );


    }

    const confirmarReativacao = async () => {

      setLoading(true);   

      const dadosSalvar = eventos.map((versions) => ({
        empresa:    versions.empresaID,
        usuario:    versions.userID,
        tipoEvento: versions.tipoEventoID,
        dia:        versions.dia
      }))

      const ativarDraft = {
        usuarioAtivacao:  user._id,
        eventos:         dadosSalvar,
      }

      await activateDraft(ativarDraft).then(response => {
        message.success('Escala Reativada!')
        carregarVersions();
      }).catch((error) => {

        if (error.response) {
            messageApi.error(error.response.data.message || 'Erro no servidor');
        } else {
            messageApi.error('Erro ao reativar Escala!');
        }        

      })
      
      setLoading(false);

      setModalReativacao(false)

    }

    const carregarVersions = async () => {

        try {

            setLoading(true);
            setEmpresa(null);
            setOptColaboradores([])
            setTypeEvent([])
            setVersions([])
            setEventos([])

            if (user.empresas) {

              try {

                const empAux = user.empresas.map((company) => company._id)
                setEmpresa(empAux)

                  // Empresa
                  const formatarDados = user.empresas.map((company) => ({
                      label: company.nome,
                      value: company._id
                  }))

                setSelectEmpresas(empAux)
                setOptionEmpresas(formatarDados)
              
                //Usuários

                setopcaoColaboradoresFiltro([])

                const allUsersAux      = await getAllUsers().then( async (response) => response.data)
                const allTypeEvents = await getAllTypeEvents().then( async (response) => response.data)
                
                let allUsers = []

                if (user.visualizarEscalas) {

                  allUsers = allUsersAux
                      .filter(user => user.empresas.length > 0 
  //                        && user.situacao === 'ATIVO'
                      )
                      .filter(colab => colab.empresas.some(emp => empAux.includes(emp._id)))
              
                } else {

                  allUsers = [user]

                }

                const formatarUser = allUsers.map((usuario) => ({
                    label:    usuario.nome,
                    value:    usuario._id,
                    empresas: usuario.empresas,
                    userID:   usuario._id,
                }))     

                setopcaoColaboradoresFiltro([{ label: 'Todos os Colaboradores', value: 'ALL' }, ...formatarUser])
                setColaboradores(formatarUser)    //Carrega todos os colabores
                setListarColab(formatarUser)      //Filtrar os colaboradores por empresa

                const tipoAux = allTypeEvents
//                                    .filter(tipo => tipo.ativo)
                                    .map(type => ({
                  id:     type._id,
                  label:  type.tipoEvento,
                  value:  type.tipoEvento,
                  cor:    type.cor
                }))

                setTypeEvent(tipoAux)

                await getAllVersionSchedules().then( async (response) => {

                  const dadosVersao = response.data.map(versao => {

                    const dadosEventos = versao.eventos.map(evento => {

                      const typeAux = evento.tipoEvento ? allTypeEvents.find( tipo => tipo._id === evento.tipoEvento) : null

                      return {
                        empresaID:    evento.empresa,
                        userID:       evento.usuario,
                        content:      evento.usuario    ? allUsers.find(usuario => usuario._id === evento.usuario)?.nome      : 'Não Localizado',
                        tipoEventoID: evento.tipoEvento,
                        tipoEvento:   typeAux ? typeAux.tipoEvento : null,
                        color:        typeAux ? typeAux.cor        : "#DA291C",  // Caso o Tipo de Evento tenha sido eliminado
                        dia:          dayjs(evento.dia).startOf('day'),
                        start:        dayjs(evento.dia).startOf('day'),
                        end:          dayjs(evento.dia).endOf('day'),
                        type:         'success', // Define o tipo de status do Badge (success, error, warning)
                      }

                    })

                    return {
                      id:               versao._id,
                      key:              versao._id,
                      title:            dayjs.utc(versao.dataAtivacao).format('DD/MM/YYYY HH:mm:ss'),
                      dataAtivacao:     versao.dataAtivacao,
                      usuarioAtivacao:  versao.usuarioAtivacao,
                      eventos:          dadosEventos
                    }
                  })

                  setVersions(dadosVersao)

                })
              } catch (error) {

              }

            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }

    }

    // Função disparada ao clicar/selecionar um nó da árvore
    const onSelectTree = (selectedKeys, info) => {

      // Se o usuário desmarcar ou clicar em um nó pai (módulo), tratamos o texto
      if (selectedKeys.length === 0 /*|| !info.node.isLeaf */) {
        return;
      }

      const key = selectedKeys[0];

      setVersaoSelec(versions.find(versao => versao.key === key))
      setEventos(versions.find(versao => versao.key === key)?.eventos)

    };


    useEffect(() => {
        carregarVersions();
    },[]);

  return (
    <div
        style={{
            height: '100%',
//            overflow:'hidden',
        }}
    >

        {contextHolder}
        <Spin 
            spinning={loading} 
            size='large' 
            description="Carregando..."
        >

          <Flex 
            justify='space-between'
            align='center'
            style={{ width: '100%',
                     paddingBottom: '5px'}}
            >

            {/* 1. Bloco invisível à esquerda para equilibrar o alinhamento */}
            <div style={{ flex: 1 }} />

            {/* 2. Título Centralizado */}
            <Title level={2}
                style={{ 
                  color: 'var(--primary-color)',
                  margin: 0, textAlign: 'center'
                }}
            >
              Versões da Escala
            </Title>

            <div 
              style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                  type='primary'
                  className="ocultar-objetos"
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  icon={<ScheduleOutlined />}
                  disabled = {eventos.length === 0}
                  onClick={handleOkVersion}
                  >
                      Reativar
              </Button>
            </div>            

          </Flex>

          <div 
            style={{
              padding: 0,
              height: '100%'
            }}
          >

            {/* O Splitter divide o espaço disponível vertical ou horizontalmente */}
            <Splitter 
              style={{ 
                height: 'calc(100vh - 60px)',                 
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              }}
            >
              
              {/* Painel Esquerdo: Menu em Árvore */}
              <Splitter.Panel 
                defaultSize="15%" 
                min="10%" 
                max="50%" 
                style={{ 
                  backgroundColor: '#ffffff',
                  padding: 10,
                  borderRadius: '12px', // Arredonda as bordas
                  overflow: 'hidden',    // Garante que o conteúdo respeite o arredondamento
                  border: '1px solid #d9d9d9' // Opcional: adiciona uma borda para destacar
                }}                  
              >

                {/* 2. Título Centralizado */}
                <Title level={3}
                    style={{ 
                      color: 'var(--primary-color)',
                      padding: '2px'
                    }}
                >
                  Versões
                </Title>

                <Tree
                  treeData={versions}
//                  defaultExpandAll
                  onSelect={onSelectTree}
                />
                
              </Splitter.Panel>

              {/* Painel Direito: Exibição do Conteúdo */}
              <Splitter.Panel 

                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px', // Arredonda as bordas
                  overflow: 'hidden',    // Garante que o conteúdo respeite o arredondamento
                  border: '1px solid #d9d9d9' // Opcional: adiciona uma borda para destacar
                }}

                >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: 5,
                    margin: 0,
                    overflowY: 'auto',                    
                  }}
                >

                  <Calendar 
//                      fullscreen={false}
                      cellRender={cellRender} 
                      headerRender={headerRender}                        
                  />

                  <Flex 
                    style={{ border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                    {typeEvent.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          flex: 1,
                          padding: '2px',
                          textAlign: 'center',
                          borderRight: index < typeEvent.length - 1 ? '1px solid #f0f0f0' : 'none',
                          background: item.cor,
                          color: 'white'
                        }}
                      >
                        {item.value}
                      </div>
                    ))}
                  </Flex>

                </div>

              </Splitter.Panel>

            </Splitter>


          </div>

          {/* 5. Modal de Confirmação do Ant Design */}
          <Modal
            title="Confirmar Reativação"
            open={modalReativacao}
            onOk={confirmarReativacao}
            onCancel={() => setModalReativacao(false)}
            okText="Reativar"
            cancelText="Cancelar"
//              okButtonProps={{ danger: true }} // Deixa o botão de confirmação vermelho
          >
            <p>Tem certeza que deseja reativar a Versão da Escala<strong> {dayjs.utc(versaoSelec.dataAtivacao).format('DD/MM/YYYY HH:mm:ss')}</strong>?</p>
            <p>Esta ação não poderá ser desfeita.</p>
          </Modal>

        </Spin>

    </div>
  )

}

export default VersionScheduleComponent