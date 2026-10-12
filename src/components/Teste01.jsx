import React, { useState } from 'react';
import { Tree } from 'antd';

// 1. Definição dos dados da árvore
const treeData = [
  {
    title: 'Meu Projeto (src)',
    key: '0-0',
    children: [
      {
        title: 'Componentes',
        key: '0-0-0',
        children: [
          { title: 'Button.jsx', key: '0-0-0-0' },
          { title: 'Card.jsx', key: '0-0-0-1' },
        ],
      },
      {
        title: 'Páginas',
        key: '0-0-1',
        children: [
          { title: 'Home.jsx', key: '0-0-1-0' },
          { title: 'Sobre.jsx', key: '0-0-1-1' },
        ],
      },
      {
        title: 'package.json',
        key: '0-0-2',
      },
    ],
  },
];

const Teste = () => {
  // 2. Estados para armazenar as chaves selecionadas e expandidas
  const [checkedKeys, setCheckedKeys] = useState(['0-0-0-0']); // Inicia com Button.jsx selecionado
  const [expandedKeys, setExpandedKeys] = useState(['0-0', '0-0-0']); // Inicia expandido

  // 3. Função executada ao marcar/desmarcar um checkbox
  const onCheck = (checkedKeysValue) => {
    console.log('Chaves selecionadas:', checkedKeysValue);
    setCheckedKeys(checkedKeysValue);
  };

  // 4. Função executada ao expandir/recolher um nó
  const onExpand = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '400px' }}>
      <h3>Exemplo de Tree com Seleção (Ant Design)</h3>
      
      <Tree
        checkable                  // Habilita o checkbox de seleção
        onExpand={onExpand}        // Evento de expansão
        expandedKeys={expandedKeys} // Chaves controladas que estão expandidas
        onCheck={onCheck}          // Evento de seleção
        checkedKeys={checkedKeys}  // Chaves controladas que estão selecionadas
        treeData={treeData}        // Dados da árvore
        showLine = {true}
      />

      <div style={{ marginTop: '16px' }}>
        <strong>IDs Selecionados:</strong> {JSON.stringify(checkedKeys)}
      </div>
    </div>
  );
};

export default Teste;
