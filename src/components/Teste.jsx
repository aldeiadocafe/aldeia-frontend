import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { getAllInventorys } from '../services/InventoryService';

// Exemplo simplificado de implementação para busca parcial (baseado na estrutura do Ant Design)
const getColumnSearchProps = (dataIndex, searchInput) => ({
  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
    <div style={{ padding: 8 }}>
      <Input
        ref={searchInput}
        placeholder={`Buscar...`}
        value={selectedKeys[0]}
        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => confirm()}
        style={{ marginBottom: 8, display: 'block' }}
      />
      <Space>
        <Button
          type="primary"
          onClick={() => confirm()}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90 }}
        >
          Buscar
        </Button>
        <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </Space>
    </div>
  ),
  filterIcon: (filtered) => (
    <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
  ),
  // Lógica principal: pesquisa insensível a maiúsculas/minúsculas e parcial
  onFilter: (value, record) =>
    record[dataIndex]
      ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
      : '',
});

const Teste = () => {
    
  const searchInput = useRef(null);
  const columns = [
    {
      title: 'Nome',
      dataIndex: 'descricao',
      ...getColumnSearchProps('descricao', searchInput),
    },
  ];

//  const data = [{ key: '1', name: 'João Silva' }, { key: '2', name: 'Maria Souza' }];
  const [data, setData] = useState([])

  useEffect(() => {

    if (data.length === 0) {

      getAllInventorys().then((response) => {

          const dadosAux = response.data.map((item) => ({
            key: item._id,
            descricao: item.descricao 
          }))
          setData(dadosAux);
      }).catch((error)=> {
          console.error(error);
      });

    }

  }, [])

  return <Table columns={columns} dataSource={data} />;

};

export default Teste;
