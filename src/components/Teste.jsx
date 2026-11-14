import React, { useState } from 'react';
import { Tree } from 'antd';

//import './Teste.css'

// 1. Definição da estrutura dos dados da árvore
const treeData = [
  {
    title: 'Empresa',
    key: '0-0',
    children: [
      {
        title: 'Tecnologia',
        key: '0-0-0',
        children: [
          { title: 'Frontend', key: '0-0-0-0' },
          { title: 'Backend', key: '0-0-0-1' },
          { title: 'DevOps', key: '0-0-0-2', disabled: true }, // Nó desabilitado
        ],
      },
      {
        title: 'Recursos Humanos',
        key: '0-0-1',
        children: [
          { title: 'Recrutamento', key: '0-0-1-0' },
          { title: 'Benefícios', key: '0-0-1-1' },
        ],
      },
    ],
  },
];

const Teste = () => {

  // 2. Estados para controlar os nós expandidos e os nós marcados
  const [expandedKeys, setExpandedKeys] = useState(['0-0', '0-0-0']);
  const [checkedKeys, setCheckedKeys] = useState(['0-0-0-0']);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  // Dispara ao expandir ou recolher um nó
  const onExpand = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  // Dispara ao marcar ou desmarcar uma caixa de seleção
  const onCheck = (checkedKeysValue) => {
    console.log('Nós selecionados:', checkedKeysValue);
    setCheckedKeys(checkedKeysValue);
  };

  return (
    <div style={{ padding: 24 }}>
      <Tree
        checkable // Habilita os checkboxes nos nós
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        onCheck={onCheck}
        checkedKeys={checkedKeys}
        treeData={treeData}
      />
    </div>
  );
  
};

export default Teste;
