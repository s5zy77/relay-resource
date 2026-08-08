import React, { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import { Check, ShieldCheck, ArrowRight, ArrowLeft, Search, ShoppingBag, X, User, MessageSquare, Send, Sparkles } from 'lucide-react'

/* =========================================================================
   1. MOCK DATA
========================================================================= */
const CATALOG_ITEMS = [
  { id: 'cam-01', name: 'Sony A7 IV Mirrorless', vendor: 'Acme Rentals', price: 3500, available: true, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop' },
  { id: 'cam-02', name: 'Canon EOS R5', vendor: 'City Lenses', price: 4200, available: false, image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=400&auto=format&fit=crop' },
  { id: 'light-01', name: 'Godox SL200 III', vendor: 'ProLight', price: 850, available: true, image: 'https://images.unsplash.com/photo-1588636737525-4b08709e8f49?q=80&w=400&auto=format&fit=crop' },
  { id: 'lens-01', name: 'Sony FE 24-70mm f/2.8 GM II', vendor: 'Acme Rentals', price: 1800, available: true, image: 'https://images.unsplash.com/photo-1617005082833-1eb58569c73c?q=80&w=400&auto=format&fit=crop' },
  { id: 'audio-01', name: 'Rode Wireless GO II', vendor: 'SoundGear', price: 600, available: true, image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=400&auto=format&fit=crop' },
  { id: 'drone-01', name: 'DJI Mavic 3 Pro', vendor: 'SkyCam India', price: 5500, available: true, image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=400&auto=format&fit=crop' }
]

/* =========================================================================
   2. AUTHENTICATION COMPONENTS
========================================================================= */
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
      <div className="auth-form-card">{children}</div>
    </div>
  </div>
)

const SocialAuth = () => (
  <div className="social-auth">
    <button className="social-btn"><GoogleIcon /><span>Google</span></button>
    <button className="social-btn compact">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    </button>
  </div>
)

const Signup = () => {
  const [agreed, setAgreed] = useState(false)
  const nav = useNavigate()
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
      <form onSubmit={e => { e.preventDefault(); nav('/catalog') }}>
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
      <div className="auth-footer">Already have an account? <Link to="/login">Sign in</Link> | <Link to="/vendor-signup">Sell as Vendor</Link></div>
      
      {/* Gateway Quick Links */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quick Access:</span>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/catalog" style={{ fontSize: '0.85rem', color: 'var(--text-heading)', fontWeight: 600, textDecoration: 'none' }}>Storefront</Link>
          <a href="/admin/" style={{ fontSize: '0.85rem', color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>SysAdmin</a>
        </div>
      </div>

      <div className="auth-secure-note" style={{ marginTop: '1.5rem' }}><ShieldCheck size={14} /><span>Secure session · 256-bit encrypted</span></div>
    </AuthLayout>
  )
}

const Login = () => {
  const [remember, setRemember] = useState(false)
  const nav = useNavigate()
  return (
    <AuthLayout>
      <div className="auth-brand"><span className="brand-name">Relay<span className="brand-dot">.</span></span></div>
      <div className="auth-header">
        <h1>Welcome back</h1>
        <p>Sign in to access your rentals and listings.</p>
      </div>
      <SocialAuth />
      <div className="auth-divider">or sign in with email</div>
      <form onSubmit={e => { e.preventDefault(); nav('/catalog') }}>
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
      
      {/* Gateway Quick Links */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quick Access:</span>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/catalog" style={{ fontSize: '0.85rem', color: 'var(--text-heading)', fontWeight: 600, textDecoration: 'none' }}>Storefront</Link>
          <a href="/admin/" style={{ fontSize: '0.85rem', color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>SysAdmin</a>
        </div>
      </div>
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
      <div className="auth-secure-note" style={{marginTop: '2.5rem'}}><ShieldCheck size={14} /><span>Secure password recovery</span></div>
    </AuthLayout>
  )
}

/* =========================================================================
   3. PORTAL CORE COMPONENTS (STOREFRONT + CHECKOUT)
========================================================================= */

const Navbar = ({ cartCount, onOpenCart }) => (
  <nav className="portal-navbar">
    <Link to="/catalog" style={{ textDecoration: 'none' }}>
      <div className="auth-brand" style={{ marginBottom: 0 }}>
        <span className="brand-name">Relay<span className="brand-dot">.</span></span>
      </div>
    </Link>
    <div className="nav-links">
      <Link to="/catalog" className="nav-link active">Catalog</Link>
      <Link to="#" className="nav-link">Cameras</Link>
      <Link to="#" className="nav-link">Lenses</Link>
      <Link to="#" className="nav-link">Lighting</Link>
    </div>
    <div className="nav-actions">
      <Search size={20} color="var(--text-heading)" style={{cursor: 'pointer'}} />
      <button className="cart-btn" onClick={onOpenCart}>
        <ShoppingBag size={20} />
        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
      </button>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1.5px solid var(--border-light)' }}>
        <User size={18} color="var(--text-muted)" />
      </div>
    </div>
  </nav>
)

const CatalogView = () => {
  const [loading, setLoading] = useState(true)
  const [catalogItems, setCatalogItems] = useState(CATALOG_ITEMS)

  useEffect(() => { 
    fetch('/api/admin/inventory')
      .then(res => res.json())
      .then(inv => {
         setCatalogItems(prev => prev.map(item => {
            // Very fuzzy mapping for demo
            const match = inv.find(i => i.name.includes(item.name.replace(' Mirrorless', '').replace(' Camera Body', '')))
            if (match && match.condition === 'error') {
               return { ...item, available: false }
            }
            return item
         }))
         setTimeout(() => setLoading(false), 500)
      })
      .catch((e) => {
         console.warn('API Proxy not booted, using strict catalog', e)
         setTimeout(() => setLoading(false), 500)
      })
  }, [])

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading catalog...</p>
      </div>
    )
  }

  return (
    <div className="catalog-container">
      <aside className="sidebar-filters">
        <div className="filter-group">
          <h4>Category</h4>
          <label className="filter-option"><input type="checkbox" defaultChecked /> All Gear</label>
          <label className="filter-option"><input type="checkbox" /> Cameras</label>
          <label className="filter-option"><input type="checkbox" /> Lenses</label>
          <label className="filter-option"><input type="checkbox" /> Lighting</label>
          <label className="filter-option"><input type="checkbox" /> Audio</label>
        </div>
        <div className="filter-group">
          <h4>Availability</h4>
          <label className="filter-option"><input type="checkbox" defaultChecked /> Available Now</label>
          <label className="filter-option"><input type="checkbox" /> Next Weekend</label>
        </div>
      </aside>
      <main>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-heading)' }}>Explore Equipment</h1>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Showing {CATALOG_ITEMS.length} results</span>
        </div>
        <div className="product-grid">
          {catalogItems.map((item) => (
            <Link to={`/catalog/${item.id}`} key={item.id} className="product-card">
              <div className="product-img-wrap">
                <div className={`availability-badge ${item.available ? 'available' : 'unavailable'}`}>
                  {item.available ? 'Available' : 'Booked'}
                </div>
                <img src={item.image} alt={item.name} />
              </div>
              <div className="product-info">
                <h3>{item.name}</h3>
                <span className="vendor-name">by {item.vendor}</span>
                <div className="product-price-row">
                  <div className="price-text">₹{item.price}<span>/day</span></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

const ProductDetail = ({ onAddToCart }) => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  
  useEffect(() => { setTimeout(() => setLoading(false), 500) }, [id])

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  const product = CATALOG_ITEMS.find((i) => i.id === (id || 'cam-01'))
  
  if (!product) {
    return (
      <div style={{ textAlign: 'center', marginTop: '6rem', color: 'var(--text-muted)' }}>
        <h2>Product Not Found</h2>
        <p>The requested equipment is no longer available.</p>
        <Link to="/catalog" className="btn-submit" style={{ display: 'inline-block', marginTop: '1rem', width: 'auto' }}>Return to Catalog</Link>
      </div>
    )
  }

  return (
    <div className="detail-layout">
      <div className="gallery-section">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="info-section">
        <h1>{product.name}</h1>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem' }}>Provided by <span style={{color: 'var(--accent)'}}>{product.vendor}</span></p>
        
        <p>This premium mirrorless equipment offers exceptional performance, perfect for hybrid scenarios requiring the best quality output.</p>
        
        <div className="booking-card">
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '1.5rem' }}>
            ₹{product.price} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ day</span>
          </div>
          
          <div className="date-selector">
            <div className="form-field">
              <label>Pickup Date</label>
              <input type="date" defaultValue="2026-11-12" />
            </div>
            <div className="form-field">
              <label>Return Date</label>
              <input type="date" defaultValue="2026-11-15" />
            </div>
          </div>
          <button 
            className="btn-submit" 
            style={{ marginTop: '1rem', opacity: product.available ? 1 : 0.5 }} 
            disabled={!product.available}
            onClick={() => onAddToCart(product)}
          >
            {product.available ? 'Add to Cart' : 'Currently Unavailable'}
          </button>
        </div>
      </div>
    </div>
  )
}

const CartDrawer = ({ isOpen, onClose, cartItems }) => {
  const nav = useNavigate()
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.days), 0)
  
  return (
    <div className={`drawer-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>Your Rental Cart</h2>
          <button className="drawer-close" onClick={onClose}><X size={24} /></button>
        </div>
        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p>{item.days} days x ₹{item.price}</p>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
                  ₹{item.price * item.days}
                </div>
              </div>
            ))
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="summary-row"><span>Equipment Rental</span><span>₹{subtotal}</span></div>
            <div className="summary-row"><span>Damage Waiver</span><span>₹450</span></div>
            <div className="summary-row total"><span>Total</span><span>₹{subtotal + 450}</span></div>
            <button className="btn-submit" onClick={() => { onClose(); nav('/checkout'); }}>Proceed to Checkout</button>
          </div>
        )}
      </div>
    </div>
  )
}

const Checkout = () => {
  const nav = useNavigate()
  return (
    <div className="checkout-layout">
      <div className="auth-brand" style={{ marginBottom: '3rem', textAlign: 'left' }}>
        <span className="brand-name">Relay<span className="brand-dot">.</span></span>
      </div>
      
      <div className="stepper">
        <div className="step-indicator completed">
          <div className="step-circle"><Check size={16} /></div>
          <span className="step-label">Dates</span>
        </div>
        <div className="step-indicator completed">
          <div className="step-circle"><Check size={16} /></div>
          <span className="step-label">Options</span>
        </div>
        <div className="step-indicator active">
          <div className="step-circle">3</div>
          <span className="step-label">Details</span>
        </div>
        <div className="step-indicator">
          <div className="step-circle">4</div>
          <span className="step-label">Payment</span>
        </div>
        <div className="step-indicator">
          <div className="step-circle">5</div>
          <span className="step-label">Confirm</span>
        </div>
      </div>

      <div className="checkout-card">
        <h2 style={{ fontSize: '1.4rem', color: 'var(--text-heading)', marginBottom: '1.5rem' }}>Pickup & Verification</h2>
        <form onSubmit={e => e.preventDefault()}>
          <div className="form-row">
            <div className="form-field full"><label>Government ID Number</label><input type="text" placeholder="Aadhar / PAN / Passport" /></div>
          </div>
          <div className="form-row">
            <div className="form-field full"><label>Special Instructions</label><input type="text" placeholder="Optional notes for vendor" /></div>
          </div>
          
          <div className="auth-divider" style={{ margin: '2rem 0' }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Return to Options
            </button>
            <button type="submit" className="btn-submit" style={{ width: 'auto', padding: '0.875rem 2.5rem' }}>
              Continue to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* =========================================================================
   4. AI CUSTOMER ASSISTANT WIDGET
========================================================================= */

const SmartCard = ({ product }) => (
  <Link to={`/catalog/${product.id}`} className="smart-card">
    <img src={product.image} alt={product.name} />
    <div className="smart-card-info">
      <h5>{product.name}</h5>
      <p>₹{product.price}/day</p>
    </div>
  </Link>
)

const AIAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { type: 'ai', text: 'Hi! Building a shooting rig or looking for specific gear? Let me help.' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatBodyRef = useRef(null)

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [messages, isTyping, isOpen])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input
    setInput('')
    setMessages(prev => [...prev, { type: 'user', text: userMsg }])
    setIsTyping(true)

    // Simulate AI response logic
    setTimeout(() => {
      setIsTyping(false)
      const aiResponse = { type: 'ai', text: 'For that setup, I highly recommend a versatile camera body and reliable continuous lighting alongside it. Here are some top choices:' }
      
      // Inject smart cards metadata to the message
      aiResponse.smartCards = [
        CATALOG_ITEMS.find(i => i.id === 'cam-01'),
        CATALOG_ITEMS.find(i => i.id === 'light-01')
      ]
      
      setMessages(prev => [...prev, aiResponse])
    }, 1800)
  }

  return (
    <div className="ai-chat-wrapper">
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="header-orb"><Sparkles size={16} /></div>
          Equipment Genie
          <button onClick={() => setIsOpen(false)} style={{marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'}}><X size={20}/></button>
        </div>
        <div className="chat-body" ref={chatBodyRef}>
          {messages.map((msg, i) => (
            <div key={i} style={{display:'flex', flexDirection:'column'}}>
               <div className={`c-msg ${msg.type}`}>{msg.text}</div>
               {msg.smartCards && (
                 <div style={{ alignSelf: 'flex-start', marginTop: '0.25rem', width: '220px' }}>
                   {msg.smartCards.map(prod => (
                     <SmartCard key={prod.id} product={prod} />
                   ))}
                 </div>
               )}
            </div>
          ))}
          {isTyping && (
            <div className="c-msg ai typing-dots-wrap">
              <div className="typing-dots"><span></span><span></span><span></span></div>
            </div>
          )}
        </div>
        <form className="chat-input-area" onSubmit={handleSend}>
          <input type="text" placeholder="e.g. Need a kit for a podcast..." value={input} onChange={e => setInput(e.target.value)} />
          <button type="submit" className="chat-send-btn"><Send size={16} /></button>
        </form>
      </div>

      {!isOpen && (
        <button className="ai-toggle-btn" onClick={() => setIsOpen(true)}>
          <MessageSquare size={26} />
        </button>
      )}
    </div>
  )
}

/* =========================================================================
   5. APP ENTRY
========================================================================= */

const App = () => {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([
    { ...CATALOG_ITEMS[0], days: 3 }
  ])

  const handleAddToCart = (product) => {
    const existing = cartItems.find(i => i.id === product.id)
    if (!existing) {
      setCartItems([...cartItems, { ...product, days: 3 }])
    }
    setIsCartOpen(true)
  }

  return (
    <BrowserRouter>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cartItems} />
      
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/vendor-signup" element={<VendorSignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/catalog/*" element={
          <div className="portal-layout">
            <Navbar cartCount={cartItems.length} onOpenCart={() => setIsCartOpen(true)} />
            <Routes>
              <Route path="/" element={<CatalogView />} />
              <Route path="/:id" element={<ProductDetail onAddToCart={handleAddToCart} />} />
            </Routes>
            <AIAssistantWidget />
          </div>
        } />
        
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
