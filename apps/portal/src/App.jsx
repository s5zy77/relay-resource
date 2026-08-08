import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Check } from 'lucide-react'

const Signup = () => (
  <div className="auth-split-wrapper">
    <div className="auth-illustration">
      {/* Decorative landscape mask mimicking the vibe */}
    </div>
    
    <div className="auth-form-container">
      <div className="auth-form-card login-aesthetic">
        <h1>Hello ! Welcome Aboard</h1>
        <p className="subtitle">We are Glad to see you 😊</p>
        
        <div className="social-row">
          <button className="social-btn">
             {/* Using standard text for now, but Google SVG icon replaces this */}
             <b>G</b> Sign up with Google
          </button>
          <button className="social-btn" style={{flex: 0.3}}>
            <b>f</b>
          </button>
          <button className="social-btn" style={{flex: 0.3}}>
            <b>𝕏</b>
          </button>
        </div>
        
        <div className="divider">or</div>
        
        <form onSubmit={e => e.preventDefault()}>
          <div className="form-grid">
            <div className="form-group">
              <label>Name</label>
              <input type="text" placeholder="" />
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="" />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="" />
            </div>
            
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="" />
            </div>
          </div>
          
          <div className="terms-wrapper">
            <input type="checkbox" id="terms" />
            <label htmlFor="terms">I agree terms of service and privacy policy</label>
          </div>
          
          <button type="submit" className="btn-primary">Sign up</button>
        </form>
      </div>
    </div>
  </div>
)

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
