import React, { useState } from 'react';
import { Tree } from 'antd';

// 1. Definição dos dados da árvore
const treeData = [
  {
    title: 'Trabalho',
    key: 'trabalho',
    children: [
      {
        title: 'Projetos',
        key: 'projetos',
        children: [
          { title: 'Frontend React', key: 'fe-react' },
          { title: 'Backend Node', key: 'be-node' },
        ],
      },
    ],
  },
  {
    title: 'Pessoal',
    key: 'pessoal',
    children: [
      { title: 'Academia', key: 'academia' },
      { title: 'Viagens', key: 'viagens' },
    ],
  },
];

const Teste = () => {
  const [checkedKeys, setCheckedKeys] = useState([]);

  // 2. Função recursiva para filtrar e manter a estrutura dos selecionados
  const getSelectedStructure = (data, checked) => {
    return data
      .map((node) => {
        // Se o nó tem filhos, filtra os filhos recursivamente
        if (node.children) {
          const filteredChildren = getSelectedStructure(node.children, checked);
          
          // Se o nó pai está selecionado OU se tem filhos selecionados, ele entra na estrutura
          if (checked.includes(node.key) || filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
          }
        }
        
        // Se for um nó folha e estiver selecionado, retorna o nó
        if (checked.includes(node.key)) {
          return { ...node };
        }
        
        return null;
      })
      .filter((node) => node !== null);
  };

  // 3. Captura o evento de seleção
  const onCheck= (checkedKeysValue) => {
    // Quando checkable, checkedKeysValue pode ser um array de chaves ou um objeto { checked, halfChecked }
    const keys = Array.isArray(checkedKeysValue) ? checkedKeysValue : checkedKeysValue.checked;
console.log(keys)    
    setCheckedKeys(keys);
  };

  // Obtém a estrutura filtrada atual
  const selectedStructure = getSelectedStructure(treeData, checkedKeys);

  return (
    <div style={{ padding: 24, display: 'flex', gap: 40 }}>
      <div style={{ flex: 1 }}>
        <h3>Selecione os itens:</h3>
        <Tree
          checkable
          defaultExpandAll
          onCheck={onCheck}
          checkedKeys={checkedKeys}
          treeData={treeData}
        />
      </div>

      <div style={{ flex: 1, background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
        <h3>Estrutura Selecionada (JSON):</h3>
        <pre>{JSON.stringify(selectedStructure, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Teste;
