import React from 'react';
import { Button } from 'antd';

const Teste = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Detecta se é Android
  const isAndroid = /android/i.test(userAgent);

  // Detecta se é Windows (Desktop)
  const isWindows = /windows nt/i.test(userAgent);

  return (
    <div>
      {isAndroid && <Button type="primary">Você está no Android</Button>}
      {isWindows && <Button type="default">Você está no Windows</Button>}
    </div>
  );
};

export default Teste;
