import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Session from './pages/Session'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <header className="navbar">
  <div className="navbar-container">
    <h1 className="navbar-title">Robotic Health</h1>
    <nav className="navbar-links">
      <Link to="/">Home</Link>
      <Link to="/login">Login/Register</Link>
      <Link to="/session">Session</Link>
    </nav>
  </div>
</header>



        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/session" element={<Session />} />
      </Routes>
       

        <footer>
          <p>&copy; 2025 Big Hero 7. All rights reserved.</p>
        </footer>
    </>
  )
}

export default App
