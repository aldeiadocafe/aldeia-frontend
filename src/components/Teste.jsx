import React, { useState } from 'react';
import { Splitter, Tree, Card } from 'antd';

// 1. Definição dos dados da Tree (Árvore)
const treeData = [
  {
    title: 'Módulo 1: Introdução',
    key: 'mod-1',
    children: [
      { title: 'Aula 1.1: O que é React', key: 'aula-1-1' },
      { title: 'Aula 1.2: Configurando o Ambiente', key: 'aula-1-2' },
    ],
  },
  {
    title: 'Módulo 2: Componentes',
    key: 'mod-2',
    children: [
      { title: 'Aula 2.1: Props e State', key: 'aula-2-1' },
      { title: 'Aula 2.2: Ciclo de Vida', key: 'aula-2-2' },
    ],
  },
];

// Mapeamento simples de chaves para conteúdos simulados
const conteudoMap = {
  'aula-1-1': 'Conteúdo detalhado sobre o que é o React, sua história e o ecossistema.',
  'aula-1-2': 'Instruções passo a passo para instalar o Node.js, VS Code e criar o primeiro app.',
  'aula-2-1': 'Explicação profunda sobre passagem de propriedades (props) e estado local (state).',
  'aula-2-2': 'Como gerenciar efeitos e renderizações usando o hook useEffect.',
};

const Teste = () => {

  // Estado para armazenar a chave do item selecionado na árvore
  const [selectedContent, setSelectedContent] = useState('Selecione uma aula na árvore para ver o conteúdo.');

  // Função disparada ao clicar/selecionar um nó da árvore
  const onSelect = (selectedKeys, info) => {
console.log(selectedKeys.length, info)    
    // Se o usuário desmarcar ou clicar em um nó pai (módulo), tratamos o texto
    if (selectedKeys.length === 0 || !info.node.isLeaf) {
      setSelectedContent('Selecione uma aula válida para carregar o conteúdo.');
      return;
    }

    const key = selectedKeys[0];
    setSelectedContent(conteudoMap[key] || 'Conteúdo não encontrado.');
  };

  return (
    <div style={{ padding: 24, height: '100vh', background: '#f5f5f5' }}>
      {/* O Splitter divide o espaço disponível vertical ou horizontalmente */}
      <Splitter style={{ height: 'calc(100vh - 48px)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', borderRadius: 8 }}>
        
        {/* Painel Esquerdo: Menu em Árvore */}
        <Splitter.Panel defaultSize="30%" min="20%" max="50%" style={{ background: '#fff', padding: 16, overflowY: 'auto' }}>
          <h3 style={{ marginBottom: 16 }}>Navegação</h3>
          <Tree
            treeData={treeData}
            defaultExpandAll
            onSelect={onSelect}
          />
        </Splitter.Panel>

        {/* Painel Direito: Exibição do Conteúdo */}
        <Splitter.Panel style={{ background: '#fff', padding: 16, overflowY: 'auto' }}>
          <Card title="Visualização do Conteúdo" bordered={false}>
            <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
              {selectedContent}
            </p>
          </Card>
        </Splitter.Panel>

      </Splitter>
    </div>
  );
};

export default Teste;
