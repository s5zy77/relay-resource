import React from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Folder, MessageSquare, Users, Calendar, Settings, Search, Camera, Lightbulb, MonitorPlay, Plus, Phone, FileText } from 'lucide-react'

/* Window Title Bar */
const WindowHeader = ({ title, children, blueTint }) => (
  <div className="window-card-header">
    <div className="dots">
      <span className="window-dot red" />
      <span className="window-dot yellow" />
      <span className="window-dot green" />
    </div>
    <span className="window-title">{title}</span>
    <div className="window-actions">{children}</div>
  </div>
)

/* Admin Login View */
const AdminLogin = () => {
  const nav = useNavigate()
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
      <div className="window-card" style={{ width: '400px' }}>
        <WindowHeader title="admin-login.exe" />
        <div className="window-card-body" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ width: 48, height: 48, background: 'var(--blue)', borderRadius: '12px', border: '2px solid var(--border-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>RelayOS Admin</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Secure system access</p>
          </div>
          <form onSubmit={e => { e.preventDefault(); nav('/') }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Admin ID</label>
              <input type="text" style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border-dark)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', outline: 'none' }} placeholder="e.g. ADM-001" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Passcode</label>
              <input type="password" style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border-dark)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', outline: 'none' }} placeholder="••••••••" />
            </div>
            <button type="submit" style={{ width: '100%', padding: '0.875rem', background: 'var(--blue)', border: '2px solid var(--border-dark)', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontFamily: 'var(--font-heading)', cursor: 'pointer', fontSize: '1rem', transition: 'var(--transition)' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--blue-pale)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--blue)'}>
              Initialize Session
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

/* Dashboard View */
const DashboardView = () => {
  const days = ['M','T','W','T','F','S','S']
  const calendarDays = Array.from({length: 28}, (_, i) => i + 1)

  return (
    <div className="dashboard-content">
      <div className="topbar">
        <h1>Dashboard</h1>
        <div className="topbar-actions">
          <div className="topbar-search">
            <Search /> search...
          </div>
          <div className="user-profile">
            <span>Admin</span>
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" alt="Profile" />
          </div>
        </div>
      </div>

      {/* Blue Hero KPI Strip */}
      <div className="hero-strip">
        <div className="kpi-item">
          <div className="kpi-label">Active Rentals</div>
          <div className="kpi-value">24</div>
          <div className="kpi-sub">+3 this week</div>
        </div>
        <div className="kpi-item">
          <div className="kpi-label">Revenue (Nov)</div>
          <div className="kpi-value">₹1.2L</div>
          <div className="kpi-sub">+12% vs Oct</div>
        </div>
        <div className="kpi-item">
          <div className="kpi-label">Overdue</div>
          <div className="kpi-value">3</div>
          <div className="kpi-sub">needs attention</div>
        </div>
        <div className="kpi-item">
          <div className="kpi-label">Pending Pickups</div>
          <div className="kpi-value">7</div>
          <div className="kpi-sub">2 scheduled today</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <span className="filter-label">Filter:</span>
        <span className="filter-chip active">All</span>
        <span className="filter-chip">Active</span>
        <span className="filter-chip">Overdue</span>
        <span className="filter-chip">Pending</span>
      </div>

      {/* Two Column Layout */}
      <div className="content-columns">

        {/* Rentals Window */}
        <div className="window-card">
          <WindowHeader title="active-rentals.list">
            <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)'}}>4 items</span>
          </WindowHeader>
          <div className="window-card-body">
            <div className="rental-item">
              <div className="rental-icon blue"><Camera size={20} /></div>
              <div className="rental-info">
                <h4>Sony A7 IV Camera Body</h4>
                <p>Arjun M. · Return Nov 13</p>
              </div>
              <span className="rental-status active">Active</span>
            </div>

            <div className="rental-item">
              <div className="rental-icon coral"><Lightbulb size={20} /></div>
              <div className="rental-info">
                <h4>Godox SL200 III Lighting Kit</h4>
                <p>Pickup pending · Priya S.</p>
              </div>
              <span className="rental-status pending">Pending</span>
            </div>

            <div className="rental-item">
              <div className="rental-icon green"><MonitorPlay size={20} /></div>
              <div className="rental-info">
                <h4>Epson 4K Pro Projector</h4>
                <p>Due yesterday · Kim T.</p>
              </div>
              <span className="rental-status overdue">Overdue</span>
            </div>

            <div className="rental-item">
              <div className="rental-icon yellow"><Camera size={20} /></div>
              <div className="rental-info">
                <h4>Canon RF 70-200mm f/2.8</h4>
                <p>Deepak R. · Return Nov 18</p>
              </div>
              <span className="rental-status active">Active</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Quick Actions — Blue Panel */}
          <div className="quick-actions-panel">
            <button className="quick-action-btn"><Plus size={16} /> New Rental</button>
            <button className="quick-action-btn"><Phone size={16} /> AI Call Demo</button>
            <button className="quick-action-btn"><FileText size={16} /> Generate Invoice</button>
          </div>

          {/* Calendar — Blue Tinted Window */}
          <div className="window-card blue-tint">
            <WindowHeader title="november-2026.cal" />
            <div className="window-card-body">
              <div className="calendar-grid">
                {days.map((d, i) => (
                  <span key={`h-${i}`} className="calendar-day-header">{d}</span>
                ))}
                {calendarDays.map(d => (
                  <span
                    key={d}
                    className={`calendar-day${d === 11 ? ' today' : ''}${d === 4 || d === 18 ? ' has-event' : ''}`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="window-card">
            <WindowHeader title="recent-activity.log">
              <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--blue-deep)', cursor: 'pointer'}}>see all</span>
            </WindowHeader>
            <div className="window-card-body">
              <div className="activity-item">
                <img className="activity-avatar" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" alt="" />
                <div className="activity-info">
                  <h4>Maren Maureen</h4>
                  <p>Deposit review completed</p>
                </div>
                <span className="activity-time">2m ago</span>
              </div>
              <div className="activity-item">
                <img className="activity-avatar" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" alt="" />
                <div className="activity-info">
                  <h4>Jennifer Jane</h4>
                  <p>New rental booking</p>
                </div>
                <span className="activity-time">15m ago</span>
              </div>
              <div className="activity-item">
                <img className="activity-avatar" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" alt="" />
                <div className="activity-info">
                  <h4>Ryan Herwinds</h4>
                  <p>Equipment returned</p>
                </div>
                <span className="activity-time">1h ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Sidebar */
const Sidebar = () => {
  const loc = useLocation()
  const path = loc.pathname

  return (
    <div className="sidebar">
      <div className="sidebar-title-bar">
        <span className="window-dot red" />
        <span className="window-dot yellow" />
        <span className="window-dot green" />
        <span className="brand">relay_os</span>
      </div>

      <div className="sidebar-nav">
        <span className="nav-section-label">Navigation</span>
        <Link to="/" className={`nav-item ${path === '/' ? 'active' : ''}`}><LayoutDashboard /> Overview</Link>
        <Link to="/rentals" className={`nav-item ${path === '/rentals' ? 'active' : ''}`}><Folder /> Rentals</Link>
        <Link to="/messages" className={`nav-item ${path === '/messages' ? 'active' : ''}`}><MessageSquare /> Messages</Link>
        <Link to="/customers" className={`nav-item ${path === '/customers' ? 'active' : ''}`}><Users /> Customers</Link>
        <Link to="/schedule" className={`nav-item ${path === '/schedule' ? 'active' : ''}`}><Calendar /> Schedule</Link>
      </div>

      <div className="sidebar-footer">
        <Link to="/settings" className="nav-item"><Settings /> Settings</Link>
      </div>
    </div>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/*" element={
          <div className="admin-layout">
            <Sidebar />
            <Routes>
              <Route path="/" element={<DashboardView />} />
            </Routes>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
