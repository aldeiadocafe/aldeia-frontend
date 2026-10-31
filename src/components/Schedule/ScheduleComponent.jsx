import { use, useEffect, useState } from 'react'
import { Form, Calendar, Modal, Button, DatePicker, Badge, message, Input, Space, Spin, Row, Col, Select, Typography, Tooltip, Radio, Flex } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import Title from 'antd/es/typography/Title';

import { useAuth } from '../Login/AuthContext';
import { normalizarTexto } from '../../Funcoes/Utils';

import dayjs from 'dayjs';

import './Schedule.css';
import { getAllUsers } from '../../services/UserService';
import { getAllTypeEvents } from '../../services/TypeEventService';
import { getAllSchedules } from '../../services/ScheduleService';

const { Text } = Typography;

const ScheduleComponent = () => {
    
    const { user } = useAuth();

    const [empresa,         setEmpresa]       = useState([])
    const [optionEmpresas,  setOptionEmpresas]= useState([])
    const [selectEmpresas,  setSelectEmpresas]= useState([])

    const [typeEvent, setTypeEvent] = useState([])

    const [colaboradores,     setColaboradores]   = useState([])
    const [listarColab,       setListarColab]     = useState([])
    const [optColaboradores, setOptColaboradores] = useState([])
    const [dados,   setDados]   = useState([]);

    const [loading, setLoading] = useState(false);

    const [eventos,           setEventos]           = useState([]);
    const [modalVisivel,      setModalVisivel]      = useState(false);
    const [eventoSelecionado, setEventoSelecionado] = useState(null);

    // Estado para armazenar o recurso selecionado no filtro
    const [opcaoColaboradoresFiltro,  setopcaoColaboradoresFiltro]  = useState([])
    const [filterResource,            setFilterResource]            = useState(['ALL']);

    const [isModalOpen,   setIsModalOpen]   = useState(false);
    
    const [form]    = Form.useForm();
    const { Item }  = Form;
/*
    const typeEvent = [
      { label: 'Trabalho',      value: 'TRABALHO',      cor: '#1677ff'},
      { label: 'Folga',         value: 'FOLGA',         cor: '#5fb107'},
      { label: 'Compensatória', value: 'COMPENSATORIA', cor: '#f1b604'}
    ]
*/
    // Abre o modal
    const showModal = async (date, info) => {

      if (info.source === 'date') {

        setIsModalOpen(true);
       
        // Define os valores do formulário. 
        // O RangePicker precisa de um array [data_inicio, data_fim]
        form.setFieldsValue({
          dateRange: [date, date], // Ambas as pontas começam no dia clicado
        });

      }

    };

    const handleListEmpresas = (empresaID) => {

      const colabEmp = []

      for (const colab of colaboradores) {

        const dadosAux = colab.empresas.find(emp => emp._id === empresaID)

        if (dadosAux) {
          colabEmp.push(colab)
        }

      }

      setOptColaboradores(colabEmp)

    }

    // Salva o intervalo selecionado no estado do calendário
    const handleOk = () => {

      form.validateFields().then((values) => {

        const { dateRange, listEmpresas, listColaboradores, tipoEvento } = values;

        const corEvento = typeEvent.find(evento => evento.value === tipoEvento)
        const nomeColab = colaboradores.find(colab => colab.value === listColaboradores)

        if (dateRange && dateRange.length === 2) {

          const start = dateRange[0];
          const end = dateRange[1];

          let inicial = dayjs(start);
          const final = dayjs(end);

          const eventoAux = []

          // Loop enquanto a data atual for anterior ou igual à data final
          while (inicial.isBefore(final) || inicial.isSame(final, 'day')) {

            const idAux = crypto.randomUUID() // Gera um ID como: "10b9a3ee-1234-4bd1-9aa6-123456789abc"

            //Verifica se já existe FUNCIONARIO/DIA
            const jaExiste = eventos.some(evento => evento.userID === listColaboradores &&
                                                    evento.dia.isSame(inicial, 'day')
            )

            if (jaExiste) {
              message.error(`No dia ${inicial.startOf('day').format('DD/MM/YYYY')} já tem evento!`);
              return;
            }

            // Adiciona o novo evento com o intervalo de datas
            eventoAux.push({
              id: idAux, // Gera um ID único para cada evento
              key: idAux, // Gera um ID único para cada evento
              empresaID:  listEmpresas,
              userID: listColaboradores,
              tipoEvento: tipoEvento,
              type: 'success', // Define o tipo de status do Badge (success, error, warning)
              color: corEvento ? corEvento.cor : null,
              dia: inicial.startOf('day'),
              start: inicial.startOf('day'),
              end: inicial.endOf('day'),
    //            end: end.endOf('day'),
              content: nomeColab ? nomeColab.label : 'Nenhum',
            });

            inicial = inicial.add(1, 'day'); // Soma 1 dia
          }

          setEventos([...eventos, ...eventoAux]);

        }

        form.resetFields(['tipoEvento','dateRange']);
//        setIsModalOpen(false);
      });
    };

    const handleCancel = () => {
      form.resetFields();
      setIsModalOpen(false);
    };

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
//          .filter((event) => filterResource === 'all' || event.userID === filterResource)
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
//                            onClick={(e) => abrirConfirmacaoDelecao(e, item)}
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

      setopcaoColaboradoresFiltro([{ label: 'Todos os Recursos', value: 'ALL' }, ...colabEmp])
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
                            showSearch
                            optionFilterProp={"label"}
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
                            mode='multiple'
                            options={opcaoColaboradoresFiltro}
                            onChange={(value) => setFilterResource(value)}
                            showSearch
                            optionFilterProp={"label"}
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
                        <Col className="ocultar-objetos">
                            <Button 
                                size="small" 
                                type="primary"
                                icon={<PrinterOutlined />}
                                onClick={handlePrint}
                            >
                                Imprimir
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );


    }

    // Função para imprimir
    const handlePrint = () => {
        window.print();
    };

    // 3. Captura o clique no evento e abre o modal
    const abrirConfirmacaoDelecao = (e, evento) => {
      e.stopPropagation(); // Evita que o clique mude a data selecionada no calendário
      setEventoSelecionado(evento);
      setModalVisivel(true);
    };

    // 4. Executa a exclusão após a confirmação
    const confirmarExclusao = () => {
      setEventos(eventos.filter((e) => e.id !== eventoSelecionado.id));
      setModalVisivel(false);      
      setEventoSelecionado(null);      
      message.success('Evento excluído com sucesso!');
    };

    const carregarDados = async () => {

        try {

            setLoading(true);
            setEmpresa(null);
            setOptColaboradores([])
            setTypeEvent([])
            setEventos([])

            if (user.empresas) {

              const empAux = user.empresas.map((company) => company._id)
              setEmpresa(empAux)

                // Empresa
                const formatarDados = user.empresas.map((company) => ({
                    label: company.nome,
                    value: company._id
                }))

              setSelectEmpresas(empAux)
              setOptionEmpresas(formatarDados)
            
              const [profileAllUsers,profileAllTypeEvents,profileAllSchedules] = await Promise.allSettled([    // Promise.all( >> Se alguma requeste falhar, o programa para
                getAllUsers().then( async response => response.data),
                getAllTypeEvents().then( async (response) => response.data),
                getAllSchedules().then( async (response) => response.data)
              ])

              const allUsers          = profileAllUsers?.status           === 'fulfilled' ? profileAllUsers.value           : null
              const allTypeEvents     = profileAllTypeEvents?.status      === 'fulfilled' ? profileAllTypeEvents.value      : null
              const allSchedules      = profileAllSchedules?.status       === 'fulfilled' ? profileAllSchedules.value       : null


              //Usuários
              setopcaoColaboradoresFiltro([])
              
              let usuariosAtivo = []

              if (user.visualizarEscalas) {

                usuariosAtivo = allUsers
                    .filter(user => user.empresas.length > 0 && 
                            user.situacao === 'ATIVO'
                    )
                    .filter(colab => colab.empresas.some(emp => empAux.includes(emp._id)))


              } else {
                
                usuariosAtivo = [user]

              }

              const formatarUser = usuariosAtivo.map((usuario) => ({
                  label:    usuario.nome,
                  value:    usuario._id,
                  empresas: usuario.empresas,
                  userID:   usuario._id,
              }))
                
              setopcaoColaboradoresFiltro([{ label: 'Todos os Recursos', value: 'ALL' }, ...formatarUser])
              setColaboradores(formatarUser)    //Carrega todos os colabores
              setListarColab(formatarUser)      //Filtrar os colaboradores por empresa

              const tipoAux = allTypeEvents
                                .filter(tipo => tipo.ativo)
                                .map(type => ({
                id:     type._id,
                label:  type.tipoEvento,
                value:  type.tipoEvento,
                cor:    type.cor
              }))

              setTypeEvent(tipoAux)

              const dadosAux = allSchedules
                                  .filter(evento => usuariosAtivo.find(ativo => ativo._id === evento.usuario._id))
                                  .filter(evento => tipoAux.find(tipo => tipo.id === evento.tipoEvento._id))
                                  .map(evento => ({
                id:           evento._id,
                key:          evento._id,                
                empresaID:    evento.empresa._id,
                userID:       evento.usuario._id,
                content:      evento.usuario.nome,
                tipoEventoID: evento.tipoEvento ? evento.tipoEvento._id         : null,
                tipoEvento:   evento.tipoEvento ? evento.tipoEvento.tipoEvento  : null,
                color:        evento.tipoEvento ? evento.tipoEvento.cor         : "#DA291C",  // Caso o Tipo de Evento tenha sido eliminado
                dia:          dayjs(evento.dia).startOf('day'),
                start:        dayjs(evento.dia).startOf('day'),
                end:          dayjs(evento.dia).endOf('day'),
                type:         'success', // Define o tipo de status do Badge (success, error, warning)
              }))
              setEventos(dadosAux)

            }

        } catch (error) {
            console.error(error);
        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {
        carregarDados();
    },[]);

  return (
    <div
        style={{
            height: '100%',
//            overflow:'hidden',
        }}
    >

        <Spin 
            spinning={loading} 
            size='large' 
            description="Carregando..."
        >
            <div style={{ textAlign: 'center' }}>
                <Title level={2}
                    style={{ color: 'var(--primary-color)'}}
                >Escala de Folga</Title>
            </div>

            <Calendar 
                cellRender={cellRender} 
                headerRender={headerRender}
//                fullCellRender={dateCellRender}   //// Renderiza a célula sem o atributo 'title' que o Ant Design coloca por padrão
//                onSelect={showModal}
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

            {/* Formulário Modal */}
            <Modal
              title="Escala"
              open={isModalOpen}
              onOk={handleOk}
              onCancel={handleCancel}
              okText="Confirmar"
              cancelText="Cancelar"
            >
              <Form 
                form={form} 
                layout="vertical" 
                name="modal_date_range"
                initialValues={{
                  tipoEvento:'TRABALHO'
                }}
                >
                <Form.Item
                  name="listEmpresas"
                  label="Empresa"
                  rules={[{ required: true, message: 'Por favor escolher uma empresa!' }]}
                >
                  <Select
                    options={optionEmpresas}
                    onChange={handleListEmpresas}
                    showSearch
                    optionFilterProp={"label"}
                  />                        
                </Form.Item>
                <Form.Item
                  name="listColaboradores"
                  label="Colaborador"
                  rules={[{ required: true, message: 'Por favor escolher colaborador!' }]}
                >
                  <Select
                    options={optColaboradores}
                    showSearch
                    optionFilterProp={"label"}
                  />                        
                </Form.Item>
                <Form.Item
                  name="tipoEvento"
                  label="Tipo de Evento"
                  rules={[{ required: true, message: 'Por favor escolher um tipo!' }]}
                >
                  <Radio.Group
                    options={typeEvent}
                    optionType="button" // Opcional: Transforma em formato de botão
                    />

                </Form.Item>

                <Form.Item
                  name="dateRange"
                  label="Selecione o Intervalo"
                  rules={[{ required: true, message: 'Por favor, selecione o intervalo de datas!' }]}
                >
                  <DatePicker.RangePicker 
                    style={{ width: '100%' }} 
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Form>
            </Modal>

            {/* 5. Modal de Confirmação do Ant Design */}
            <Modal
              title="Confirmar Exclusão"
              open={modalVisivel}
              onOk={confirmarExclusao}
              onCancel={() => setModalVisivel(false)}
              okText="Excluir"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }} // Deixa o botão de confirmação vermelho
            >
              <p>Tem certeza que deseja excluir  <strong>"{eventoSelecionado?.content} - {eventoSelecionado?.start.format('DD/MM/YYYY')} - {eventoSelecionado?.end.format('DD/MM/YYYY')} - {eventoSelecionado?.tipoEvento}"</strong>?</p>
              <p>Esta ação não poderá ser desfeita.</p>
            </Modal>

        </Spin>

    </div>
  )

}

export default ScheduleComponent