import React from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, MessageSquare, Users, Calendar, Settings, Folder } from 'lucide-react'

// Dashboard Component matching Image 2 spatial layout precisely
const DashboardView = () => {
  return (
    <div className="dashboard-content">
      <div className="topbar">
        <h1>My Rentals</h1>
        <div className="topbar-actions">
          <div className="user-profile">
            <span>Christine Eva</span>
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" alt="Profile" />
          </div>
        </div>
      </div>
      
      {/* Top filters like in Image 2 */}
      <div style={{display: 'flex', gap: '2rem', marginBottom: '2.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem'}}>
        <span>Filter by:</span>
        <span style={{background: 'white', padding: '0.25rem 1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>Time ⌄</span>
        <span style={{background: 'white', padding: '0.25rem 1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>Category ⌄</span>
        <span style={{background: 'white', padding: '0.25rem 1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>Status ⌄</span>
      </div>

      <div className="content-grid">
        <div className="card card-tint-1" style={{ display: 'flex', flexDirection: 'column'}}>
           
           <div className="list-item-card blue-tint">
             <div className="item-icon"></div>
             <div className="item-content">
               <h3>Professional DSLR Camera</h3>
               <p>Rented active • Return Due Nov 13</p>
             </div>
             <div className="action-circle">➔</div>
           </div>

           <div className="list-item-card pink-tint">
             <div className="item-icon"></div>
             <div className="item-content">
               <h3>Studio Lighting Kit</h3>
               <p>Pickup Pending • Jung Jaehyun</p>
             </div>
             <div className="action-circle">➔</div>
           </div>
           
           <div className="list-item-card">
             <div className="item-icon"></div>
             <div className="item-content">
               <h3>4K Video Projector</h3>
               <p>Maintenance • Kim Taeyeong</p>
             </div>
             <div className="action-circle">➔</div>
           </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
             <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
               <h3>Nov 2026</h3>
               <span style={{color: 'var(--text-secondary)', letterSpacing: '2px'}}>{'< >'}</span>
             </div>
             <div style={{display: 'flex', justifyContent: 'center'}}>
               <div style={{width: '100%', height: '220px', background: 'white', borderRadius: '16px', border: '1px solid var(--bg-dashboard)'}}>
                 {/* Visual Mock of Calendar Grid */}
                 <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                   <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                   {Array.from({length: 21}).map((_, i) => (
                     <span key={i} style={{padding: '0.5rem', borderRadius: '50%', background: i===10 ? 'var(--text-primary)' : 'transparent', color: i===10 ? 'white' : 'var(--text-primary)'}}>{i+1}</span>
                   ))}
                 </div>
               </div>
             </div>
          </div>
          
          <div className="card">
             <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
               <h3>Online Operations</h3>
               <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>See all</span>
             </div>
             
             <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem'}}>
               <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" style={{width: '44px', height: '44px', borderRadius: '50%', objectFit:'cover'}} />
               <div style={{flex: 1}}>
                 <h4 style={{fontSize: '1rem'}}>Maren Maureen</h4>
                 <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Reviewing Deposit</p>
               </div>
               <div style={{width: 8, height: 8, background: 'var(--text-primary)', borderRadius: '50%'}}></div>
             </div>
             
             <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem'}}>
               <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" style={{width: '44px', height: '44px', borderRadius: '50%', objectFit:'cover'}} />
               <div style={{flex: 1}}>
                 <h4 style={{fontSize: '1rem'}}>Jennifer Jane</h4>
                 <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Active Chat</p>
               </div>
               <div style={{width: 8, height: 8, background: 'var(--text-primary)', borderRadius: '50%'}}></div>
             </div>
             
          </div>
        </div>
      </div>

    </div>
  )
}

const Sidebar = () => {
  const loc = useLocation();
  const path = loc.pathname;
  
  return (
    <div className="sidebar">
      <div className="brand">
        <span style={{color: 'var(--text-primary)'}}>ē</span>
        <span>RentalOS</span>
      </div>
      
      <p style={{fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-secondary)', paddingLeft: '1.25rem', marginBottom: '0.5rem', marginTop: '1rem'}}>Dashboard</p>
      
      <div className="nav-section">
        <Link to="/" className={`nav-item ${path === '/' ? 'active' : ''}`}><LayoutDashboard /> Overview</Link>
        <Link to="/rentals" className={`nav-item ${path === '/rentals' ? 'active' : ''}`}><Folder /> All Rentals</Link>
        <Link to="/messages" className={`nav-item ${path === '/messages' ? 'active' : ''}`}><MessageSquare /> Messages</Link>
        <Link to="/customers" className={`nav-item ${path === '/customers' ? 'active' : ''}`}><Users /> Customers</Link>
        <Link to="/schedule" className={`nav-item ${path === '/schedule' ? 'active' : ''}`}><Calendar /> Schedule</Link>
      </div>
      
      <div style={{flex: 1}}></div>
      
      <div className="nav-section">
        <Link to="/settings" className={`nav-item`}><Settings /> Settings</Link>
      </div>
    </div>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <div className="admin-layout">
        <Sidebar />
        <Routes>
          <Route path="/" element={<DashboardView />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
