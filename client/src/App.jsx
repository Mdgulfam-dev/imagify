
import './App.css'
import BuyCredit from './pages/BuyCredit'
import Home from './pages/Home'
import Result from './pages/Result'
import { Routes, Route } from 'react-router-dom'

function App() {
 

  return (
    <>
      <div>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/buy' element={<BuyCredit/>} />
        <Route path='/result' element={<Result/>} />
        
        

      </Routes>
      
      </div>
      
    </>
  )
}

export default App
