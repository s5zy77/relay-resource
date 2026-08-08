import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Check, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react'

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const AuthLayout = ({ children, visualComponent }) => (
  <div className="auth-page">
    <div className="auth-visual">
      {visualComponent || (
        <>
          <img src="/images/signup-hero.png" alt="Dramatic forest canopy" />
          <div className="auth-visual-overlay" />
          <div className="auth-visual-text">
            <div className="auth-visual-badge">Trusted by 2,000+ creators</div>
            <h2>Your vision deserves<br/>the right equipment.</h2>
            <p>Cameras, lighting, audio gear — rent it all from verified owners in your city.</p>
          </div>
        </>
      )}
    </div>
    <div className="auth-form-panel">
      <div className="auth-form-card">
        {children}
      </div>
    </div>
  </div>
)

const SocialAuth = () => (
  <div className="social-auth">
    <button className="social-btn">
      <GoogleIcon /><span>Google</span>
    </button>
    <button className="social-btn compact">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    </button>
    <button className="social-btn compact">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    </button>
  </div>
)

const Signup = () => {
  const [agreed, setAgreed] = useState(false)
  return (
    <AuthLayout>
      <div className="auth-brand"><span className="brand-name">Relay<span className="brand-dot">.</span></span></div>
      <div className="auth-header">
        <span className="label-tag">Get Started</span>
        <h1>Create your account</h1>
        <p>Join the rental marketplace</p>
      </div>
      <SocialAuth />
      <div className="auth-divider">or</div>
      <form onSubmit={e => e.preventDefault()}>
        <div className="form-row">
          <div className="form-field"><label>Full Name</label><input type="text" placeholder="John Doe" /></div>
          <div className="form-field"><label>Email</label><input type="email" placeholder="john@example.com" /></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label>Password</label><input type="password" placeholder="Min. 8 characters" /></div>
          <div className="form-field"><label>Confirm Password</label><input type="password" placeholder="Re-enter password" /></div>
        </div>
        <div className="terms-row">
          <div className="custom-checkbox">
            <input type="checkbox" id="terms" checked={agreed} onChange={() => setAgreed(!agreed)} />
            <div className="checkmark"><Check strokeWidth={3} /></div>
          </div>
          <label htmlFor="terms">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
        </div>
        <button type="submit" className="btn-submit">Create Account</button>
      </form>
      <div className="auth-footer">
        Already have an account? <Link to="/login">Sign in</Link> | <Link to="/vendor-signup">Sell as Vendor</Link>
      </div>
      <div className="auth-secure-note"><ShieldCheck size={14} /><span>Secure session · 256-bit encrypted</span></div>
    </AuthLayout>
  )
}

const Login = () => {
  const [remember, setRemember] = useState(false)
  return (
    <AuthLayout>
      <div className="auth-brand"><span className="brand-name">Relay<span className="brand-dot">.</span></span></div>
      <div className="auth-header">
        <h1>Welcome back</h1>
        <p>Sign in to access your rentals and listings.</p>
      </div>
      <SocialAuth />
      <div className="auth-divider">or sign in with email</div>
      <form onSubmit={e => e.preventDefault()}>
        <div className="form-row">
          <div className="form-field full"><label>Email</label><input type="email" placeholder="john@example.com" /></div>
        </div>
        <div className="form-row" style={{marginBottom: '0'}}>
          <div className="form-field full"><label>Password</label><input type="password" placeholder="Enter your password" /></div>
        </div>
        <div className="terms-row" style={{ marginTop: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="custom-checkbox">
              <input type="checkbox" id="remember" checked={remember} onChange={() => setRemember(!remember)} />
              <div className="checkmark"><Check strokeWidth={3} /></div>
            </div>
            <label htmlFor="remember" style={{ margin: 0 }}>Remember me</label>
          </div>
          <Link to="/forgot-password" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>Forgot Password?</Link>
        </div>
        <button type="submit" className="btn-submit">Sign In</button>
      </form>
      <div className="auth-footer">Don't have an account? <Link to="/signup">Sign up</Link></div>
    </AuthLayout>
  )
}

const VendorSignup = () => {
  const [agreed, setAgreed] = useState(false)
  
  const vendorVisual = (
    <>
      <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1500&auto=format&fit=crop" alt="Vendor workplace" />
      <div className="auth-visual-overlay" />
      <div className="auth-visual-text">
        <div className="auth-visual-badge">Earn with your gear</div>
        <h2>Turn your idle<br/>assets into income.</h2>
        <p>Join our massive network of rental providers and start monetizing your equipment today.</p>
      </div>
    </>
  )

  return (
    <AuthLayout visualComponent={vendorVisual}>
      <div className="auth-brand"><span className="brand-name">Relay<span className="brand-dot">.</span></span></div>
      <div className="auth-header">
        <span className="label-tag">Become a Vendor</span>
        <h1>Create vendor profile</h1>
        <p>List your inventory and start earning.</p>
      </div>
      <form onSubmit={e => e.preventDefault()}>
        <div className="form-row">
          <div className="form-field full"><label>Business Name</label><input type="text" placeholder="e.g. Acme Lens Rentals" /></div>
          <div className="form-field full"><label>Contact Email</label><input type="email" placeholder="vendor@example.com" /></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label>Password</label><input type="password" placeholder="Min. 8 characters" /></div>
          <div className="form-field"><label>City</label><input type="text" placeholder="City" /></div>
        </div>
        <div className="terms-row">
          <div className="custom-checkbox">
            <input type="checkbox" id="terms-vendor" checked={agreed} onChange={() => setAgreed(!agreed)} />
            <div className="checkmark"><Check strokeWidth={3} /></div>
          </div>
          <label htmlFor="terms-vendor">I agree to the <a href="#">Vendor Terms</a> and <a href="#">Fee Schedule</a></label>
        </div>
        <button type="submit" className="btn-submit">Register Business</button>
      </form>
      <div className="auth-footer">Already a vendor? <Link to="/login">Sign in</Link></div>
    </AuthLayout>
  )
}

const ForgotPassword = () => {
  const nav = useNavigate()
  return (
    <AuthLayout>
      <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back
      </button>
      <div className="auth-header">
        <h1>Reset Password</h1>
        <p>Enter your email to receive a password reset link.</p>
      </div>
      <form onSubmit={e => e.preventDefault()}>
        <div className="form-row">
          <div className="form-field full"><label>Email address</label><input type="email" placeholder="john@example.com" /></div>
        </div>
        <button type="submit" className="btn-submit" style={{ marginTop: '1rem' }}>Send Reset Link <ArrowRight size={16} style={{ verticalAlign: 'middle', marginLeft: '0.5rem' }}/></button>
      </form>
      <div className="auth-secure-note" style={{marginTop: '2.5rem'}}>
        <ShieldCheck size={14} /><span>Secure password recovery</span>
      </div>
    </AuthLayout>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/vendor-signup" element={<VendorSignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

