
import { useContext } from 'react'
import './App.css'
import Footer from './components/Footer'
import Login from './components/Login'
import Navbar from './components/Navbar'
import { AppContext } from './context/AppContext'
import BuyCredit from './pages/BuyCredit'
import Home from './pages/Home'
import Result from './pages/Result'
import { Routes, Route } from 'react-router-dom'
import React from 'react';
import { ToastContainer } from 'react-toastify';


function App() {

  const {showLogin} = useContext(AppContext);
 

  return (
    <>
      <div className='px-4 py-6 sm:px-10 md:px-4 lg:px-8 min-h-screen  bg-gradient-to-b from-teal-50 to-orange-50 '>
      <ToastContainer position='bottom-right' />
      <Navbar/>
      { showLogin && <Login/>}
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/buy' element={<BuyCredit/>} />
        <Route path='/result' element={<Result/>} />
        
        

      </Routes>
      <Footer/>
      
      </div>
      
    </>
  )
}

export default App
