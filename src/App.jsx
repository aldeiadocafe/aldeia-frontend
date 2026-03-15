import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { DatePicker, ConfigProvider } from 'antd'

// 1. Importar o locale do Antd
import ptBR from 'antd/locale/pt_BR';

// 2. Importar o locale do Day.js
import 'dayjs/locale/pt-br';
import dayjs from 'dayjs';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/reset.css'; // Para Ant Design v5

import { AuthProvider } from './components/Login/AuthContext';
import Login from './components/Login/Login';
import { PrivateRoute } from './components/Login/PrivateRoute';
import MainLayout from './components/Main/MainLayout';
import DashComponent from './components/Main/DashComponent';
import ListCompanysComponent from './components/Configuracoes/ListCompanysComponent';
import ListUsersComponent from './components/Configuracoes/ListUsersComponent';
import ListConversationsComponent from './components/Stock/ListConversationsComponent';
import ListItemComponent from './components/Stock/ListItemComponent';
import ImportEstoqueGComComponent from './components/GComs/ImportGComComponent';
import ListStockBalanceComponent from './components/Stock/ListStockBalanceComponent';
import ListDatesItemBalanceComponent from './components/Stock/ListDatesItemBalanceComponent';
import ListInventoryComponent from './components/Inventorys/ListInventoryComponent';
import ListPlacesInventoryComponent from './components/Inventorys/ListPlacesInventoryComponent';
import ConferenceComponent from './components/Inventorys/ConferenceComponent';
import ItemConfComponent from './components/Inventorys/ItemConfComponent';
import ImportInvoicesComponent from './components/Receipts/ImportInvoicesComponent';
import ListUnitsComponent from './components/Stock/ListUnitComponent';


// 3. Definir o locale do dayjs globalmente
dayjs.locale('pt-br');

const { RangePicker } = DatePicker

function App() {


  return (

    <>
      
      <ConfigProvider locale={ptBR}>
      
        <BrowserRouter>      

          <AuthProvider>

            <Routes>

              {/* Rotas Protegidas com Sidebar */}
              <Route path="/login" element={<Login/>} />

              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <MainLayout/>
                  </PrivateRoute>
                }
              >

                <Route index 
                  element={
                    <PrivateRoute>
                      <DashComponent/>
                    </PrivateRoute>
                  }
                  />

                  {/* http://localhost:5173/companys */}
                  <Route path='/companys'    
                    element={
                      <PrivateRoute>
                        <ListCompanysComponent/>
                      </PrivateRoute>
                    }/>

                  {/* http://localhost:5173/users */}
                  <Route path='/users'    
                    element={
                      <PrivateRoute>
                        <ListUsersComponent/>
                      </PrivateRoute>
                    }/>

                  {/* http://localhost:5173/units */}
                  <Route path='/units'    
                    element={
                      <PrivateRoute>
                        <ListUnitsComponent/>
                      </PrivateRoute>
                    }/>

                  {/* http://localhost:5173/items */}
                  <Route path='/items'    
                    element={
                      <PrivateRoute>
                        <ListItemComponent/>
                      </PrivateRoute>
                    }/>

                  {/* http://localhost:5173/conversationsitem */}
                  <Route path='/conversationsitem'    
                    element={
                      <PrivateRoute>
                        <ListConversationsComponent/>
                      </PrivateRoute>
                    }/>

                  {/* http://localhost:5173/estoquegcom */}
                  <Route path='/estoquegcom'    
                    element={
                      <PrivateRoute>
                        <ImportEstoqueGComComponent/>
                      </PrivateRoute>
                    }/>

                  {/* http://localhost:5173/stockbalance */}
                  <Route path='/stockbalance'    
                    element={
                      <PrivateRoute>
                        <ListStockBalanceComponent/>
                      </PrivateRoute>
                    }/>

                  {/* http://localhost:5173/datesitemsbalance */}
                  <Route path='/datesitemsbalance'    
                    element={
                      <PrivateRoute>
                        <ListDatesItemBalanceComponent/>
                      </PrivateRoute>
                    }/>

                  {/* http://localhost:5173/inventorys */}
                  <Route path='/inventorys'    
                    element={
                      <PrivateRoute>
                        <ListInventoryComponent/>
                      </PrivateRoute>
                    }/>

                  {/* http://localhost:5173/placesinventory */}
                  <Route path='/placesinventory'    
                    element={
                      <PrivateRoute>
                        <ListPlacesInventoryComponent/>
                      </PrivateRoute>
                    }/>

                  {/* http://localhost:5173/conferences */}
                  <Route path='/conferences'    
                    element={
                      <PrivateRoute>
                        <ConferenceComponent/>
                      </PrivateRoute>
                    }/>

                  {/* http://localhost:5173/item-conference */}
                  <Route path='/item-conference/:id'    
                    element={
                      <PrivateRoute>
                        <ItemConfComponent/>
                      </PrivateRoute>
                    }/>

                  {/* http://localhost:5173/invoices */}
                  <Route path='/importarnfe'    
                    element={
                      <PrivateRoute>
                        <ImportInvoicesComponent/>
                      </PrivateRoute>
                    }/>

              </Route>
              
            </Routes>

          </AuthProvider>
        
        </BrowserRouter>

      </ConfigProvider>
      
    </>
  )
}

export default App
