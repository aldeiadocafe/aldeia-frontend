import { Table } from 'antd';

const columns = [
  {
    title: 'Company',
    dataIndex: 'company',
    // 1. Define Filter Options
    filters: [
      { text: 'Company A', value: 'Company A' },
      { text: 'Company B', value: 'Company B' },
    ],
    // 2. Specify Filter Logic
    onFilter: (value, record) => record.company.indexOf(value) === 0,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    filters: [
      { text: 'Active', value: 'Active' },
      { text: 'Inactive', value: 'Inactive' },
    ],
    onFilter: (value, record) => record.status.indexOf(value) === 0,
    // filterMultiple: true, // Optional: defaults to true
  },
];

const data = [
  { key: '1', company: 'Company A', status: 'Active' },
  { key: '2', company: 'Company B', status: 'Inactive' },
];

const Teste = () => <Table columns={columns} dataSource={data} />;
export default Teste;
