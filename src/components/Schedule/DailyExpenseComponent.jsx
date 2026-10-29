import { useEffect, useMemo, useState } from 'react';
import { Card, Form, Select, Spin, DatePicker, Button, Row, Col, Table, Input, Space, message} from 'antd';
import Title from 'antd/es/typography/Title';

import { useAuth } from '../Login/AuthContext';
import { normalizarTexto } from '../../Funcoes/Utils';

import dayjs from 'dayjs';

import { getAllTypeEvents } from '../../services/TypeEventService';
import { getAllSchedules } from '../../services/ScheduleService';
import { getAllUsers } from '../../services/UserService';
import { getAllVersionSchedules } from '../../services/VersionScheduleService';
import { getAllCompanys } from '../../services/CompanyService';
import { FileSearchOutlined, SearchOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker

const DailyExpenseComponent = () => {

    const { user } = useAuth();

    const [empresas,        setEmpresas]        = useState([])
    const [filterEmpresas,  setFilterEmpresas]  = useState([])

    const [schedules,       setSchedules]       = useState([])
    const [typeEvent,       setTypeEvent]       = useState([])
    
    const [colaboradores,   setColaboradores]   = useState([])
    const [filterColab,     setFilterColab]     = useState([])

    const [dados,           setDados]           = useState([])

    const [ formPesquisa ]  = Form.useForm();
    const { Item }  = Form;

    const [loading, setLoading] = useState(false)

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 2,
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

    const colunas = 
    [
        {
            dataIndex:  'empresa',
            key:  'empresa',
            title: 'Empresa',
            filters: filterEmpresas,
            // Método de filtragem
            onFilter: (value, record) => {
                return record.empresa.includes(value)
            },
            sorter: (a, b) => a.empresa.localeCompare(b.empresa),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ellipsis: true,
            
        },
        {
            title: 'Colaborador',
            dataIndex: 'colaborador',
            key: 'colaborador',
            filters: filterColab,
            // Método de filtragem
            onFilter: (value, record) => {
                return record.colaborador.includes(value)
            },
            sorter: (a, b) => a.colaborador.localeCompare(b.colaborador),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ellipsis: true,
        },
        {
            title: 'Dias',
            dataIndex: 'dias',
            key: 'dias',
            width: '8%',
            align: 'right',
        },
        {
            title: 'Vale Transporte',
            dataIndex: 'valeTransporte',
            key: 'valeTransporte',
            width: '15%',
            align: 'right',
            render: (value) => formatter.format(value)
        },
        {
            title: 'Vale Refeição',
            dataIndex: 'valeRefeicao',
            key: 'valeRefeicao',
            width: '15%',
            align: 'right',
            render: (value) => formatter.format(value)
        },

    ]

    const carregarDados = async () => {

        try {

            setLoading(true)
            
            setEmpresas([])
            setSchedules([])
            setTypeEvent([])
            setColaboradores([])

            if (user.empresas) {

                setEmpresas(user.empresas)

                //Carregar Colabordor
                let usuariosAtivo = [user]
                
                if (user.visualizarEscalas) {

                    const [allCompany, allUsers, allType, allSchedule, allVersion] = await Promise.all([
                        getAllCompanys().then(async response => response.data),
                        getAllUsers().then( async response => response.data),
                        getAllTypeEvents().then( async response => response.data),
                        getAllSchedules().then( async (response) => response.data),
                        getAllVersionSchedules().then( async (response) => response.data)
                    ])

                    const typeCalcular = allType.filter(type => type.calcularDespesa)

                    const empID = user.empresas.map((company) => company._id)
                    const formatarFilter = user.empresas.map((company) => ({
                        value: company.nome,
                        text: company.nome,
                    }))
                    setFilterEmpresas(formatarFilter)

                    usuariosAtivo = allUsers
                        .filter(user => user.empresas.length > 0 && 
                                user.situacao === 'ATIVO'
                        )
                        .filter(colab => colab.empresas.some(emp => empID.includes(emp._id)))
                        
                    setColaboradores(usuariosAtivo)

                    const formatarFilterColab = usuariosAtivo.map((user) => ({
                        value: user.nome,
                        text: user.nome,
                    }))
                    setFilterColab(formatarFilterColab)

                    //Carregar Type Schedule - Calcular Despesa
                    const typeID = typeCalcular.map(type => type._id)

                    let dadosSchedule = []

                    //Carregar Schedule
                    const auxSchedule = allSchedule
                                    .filter(evento => usuariosAtivo.find(ativo => ativo._id === evento.usuario._id))
                                    .filter(evento => typeID.find(tipo => tipo === evento.tipoEvento._id))
                                    .map(evento => {

                        return {
                            id:         evento._id,
                            empresa:    evento.empresa,
                            user:       evento.usuario,
                            tipoEvento: evento.tipoEvento,
                            dia:        dayjs(evento.dia).startOf('day'),
                        }

                    })

                    const dadosAux = [{
                        value:      'ATIVA',
                        label:      'ATIVA',
                        eventos:    auxSchedule,
                        id:         crypto.randomUUID()
                    }]

                    dadosSchedule = dadosAux

                    let dadosVersion = []

                    //Carregar Versoes
                    const dadosVersao = allVersion.map(versao => {

                        const dadosEventos = versao.eventos
                                    .filter(evento => usuariosAtivo.find(ativo => ativo._id === evento.usuario))
                                    .filter(evento => typeID.find(tipo => tipo === evento.tipoEvento))
                                    .map(evento => {

                                        return {
                                            empresa:    evento.empresa ? allCompany.find(empresa => empresa._id === evento.empresa) : null,
                                            user:       evento.usuario ? allUsers.find(usuario => usuario._id === evento.usuario)   : null,
                                            tipoEvento: evento.tipoEvento ? typeCalcular.find(type => type._id === evento.tipoEvento)    : null,
                                            dia:        dayjs(evento.dia).startOf('day'),
                                        }

                                    })

                        return {
                            value:      dayjs.utc(versao.dataAtivacao).format('DD/MM/YYYY HH:mm:ss'),
                            label:      dayjs.utc(versao.dataAtivacao).format('DD/MM/YYYY HH:mm:ss'),
                            eventos:    dadosEventos,
                            id:         crypto.randomUUID()
                        }                                        

                    })

                    setSchedules([...dadosSchedule, ...dadosVersao])

                }

            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }

    }

    const btnCalcular = (values) => {

        setLoading(true)

        const dadosCalcular = schedules
                            .filter(eventos => eventos.value === values.escala)
                            .map(eventos => {

                                return {
                                    ...eventos,

                                    //Filtrar por data
                                    eventos: eventos.eventos.filter(evento => {
                                        return evento.dia >= values.periodo[0] && evento.dia <= values.periodo[1]
                                    })
                                }

                            })

        if (!dadosCalcular || 
            dadosCalcular[0].eventos.length === 0) {

            message.error('Nenhum registro encontrado!')
            setLoading(false)
            return

        }

        //Extrai todos os eventos de dentro da escala (caso haja mais de uma escala no array)
        const todosEventos = dadosCalcular.flatMap(escala => escala.eventos || [])

        const agrupado = {}
        todosEventos.map(eventos => {

            const chave = `${eventos.empresa.nome} | ${eventos.user.nome}` 

            if (!agrupado[chave]) {
                agrupado[chave] = {
                    empresa: eventos.empresa.nome,
                    colaborador: eventos.user.nome,
                    dias: 0,
                    valeTransporte: 0,
                    valeRefeicao:   0
                }
            }

            agrupado[chave].dias  += 1
            agrupado[chave].valeTransporte  += eventos.user.valeTransporte
            agrupado[chave].valeRefeicao    += eventos.user.valeRefeicao

        })

        setDados(Object.values(agrupado))

        setLoading(false)

    }

    const zerarDados = () => {
        setDados([])
    }

    useEffect( () => {

        carregarDados()

    }, [])

    return (

        <div>
            <div style={{ textAlign: 'center' }}>
                <Title level={2}
                    style={{ color: 'var(--primary-color)'}}
                >Despesas Diárias</Title>
            </div>

            <Spin
                spinning={loading} 
                size='large' 
                description="Carregando..."
            >

                <Card
                    title="Pesquisar"
                    loading={loading}                    
                    style={{                   
                        padding: 0,
                        margin: 0,     
//                        marginBottom: '10px',
                        color: 'var(--primary-color)',
                        borderColor: 'var(--primary-color)',
                        boxShadow: '0 2px 8px #d4b8ab',
                        borderRadius: 8,
                                                
                    }}
                >
                    
                    <Card
                        bordered={false}
                        style={{
                            margin: 0,
                            padding: 0
                        }}
                    >

                        <Form
                            form={formPesquisa}
                            initialValues={{
                                escala: 'ATIVA'
                            }}
                            onFinish={btnCalcular}
                        >

                            <Item
                                name={"escala"}
                                label="Escala"
                                rules={[{
                                    required: true,
                                    message: 'Selecionar Escala para calcular'
                                }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Selecionar Escala"
                                    options={schedules}
                                    style={{ width: 200 }}
                                    onChange={zerarDados}
                                >

                                </Select>

                            </Item>

                            <Row
                                gutter={[16, 16]}
                            >
                                <Col>
                                    <Item
                                        name="periodo"
                                        label="Período Calculo"
                                        rules={[{
                                            required: true,
                                            message: 'Informar período para calculo'
                                        }]}
                                        >
                                            <RangePicker
                                                format="DD/MM/YYYY"
                                                onChange={zerarDados}
                                                />

                                    </Item>
                                </Col>
                                <Col>
                                        <Item>
                                            <Button
                                                type='primary'
                                                htmlType='submit'
                                            >
                                                Calcular
                                            </Button>
                                        </Item>
                                </Col>

                            </Row>

                        </Form>

                    </Card>

                    <Card
                        bordered={false}
                        style={{
                            margin: 0,
                            padding: 0
                        }}
                    >

                        <Table
                            columns={colunas}
                            dataSource={dados}
                            showSorterTooltip={true}
                            size='small'
                            rowKey={record => record._id}
                            pagination={false}
                        >

                        </Table>

                    </Card>

                </Card>

            </Spin>

        </div>
    )
}

export default DailyExpenseComponent