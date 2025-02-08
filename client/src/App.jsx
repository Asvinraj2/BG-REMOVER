import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Result from './pages/Result'
import BuyCredit from './pages/BuyCredit'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

const App = () => {
  return (
    <div>
    <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Result' element={<Result />} />
        <Route path='/Buy' element={<BuyCredit />} />
      </Routes>
      <Footer />
      
    </div>
  )
}

export default App
