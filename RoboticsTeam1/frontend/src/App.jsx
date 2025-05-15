import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <body>
        <header>
          <h1>Robotic Health</h1>
          <nav>
            <a href="#">Home</a>
            <a href="#about">Login/Register</a>
            <a href="#services">Session</a>
          </nav>
        </header>

        <section class="hero">
          <h2>Revolutionizing Healthcare with Robotics and AI</h2>
        </section>

        <section class="section" id="about">
          <h3>About Us</h3>
          <p>Robotic Health combines cutting-edge robotics and artificial intelligence to deliver high-quality, efficient, and accessible healthcare solutions. From remote diagnostics to robotic-assisted surgeries, we are paving the way for the future of medicine.</p>
        </section>

        <section class="section" id="services">
          <h3>Our Services</h3>
          <div class="services">
            <div class="card">
              <h4>AI Diagnosis</h4>
              <p>Advanced AI systems to assist doctors in accurate and fast diagnostics.</p>
            </div>
            <div class="card">
              <h4>Robotic Surgery</h4>
              <p>Minimally invasive robotic-assisted surgical procedures for better outcomes.</p>
            </div>
            <div class="card">
              <h4>Remote Monitoring</h4>
              <p>Continuous patient monitoring using smart sensors and robotics.</p>
            </div>
          </div>
        </section>

        <section class="section" id="testimonials">
          <h3>What Our Patients Say</h3>
          <p>“Thanks to Robotic Health, my recovery was faster and less painful. Their technology is truly life-changing.” — Sarah M.</p>
        </section>

        <footer>
          <p>&copy; 2025 Big Hero 7. All rights reserved.</p>
        </footer>

        </body>
    </>
  )
}

export default App
