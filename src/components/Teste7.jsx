import { Grid } from 'antd';
const { useBreakpoint } = Grid;

const Teste = () => {
  const screens = useBreakpoint();
  
  // screens contém booleanos para cada breakpoint
  // Exemplo: screens.md (true se for tablet/desktop)
  console.log(screens);                
  
  return (
    <div>
      {screens.md ? 'Tablet/Desktop' : 'Celular'}
    </div>
  );
};

export default Teste;
