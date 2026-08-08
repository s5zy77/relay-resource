import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Folder, MessageSquare, Users, Calendar, Settings, Search, Camera, Lightbulb, MonitorPlay, Plus, Phone, FileText, List, KanbanSquare, Box } from 'lucide-react'

/* =========================================================================
   1. MOCK DATA
========================================================================= */
const MOCK_RENTALS = [
  { id: 'R-7790', customer: 'Arjun M.', item: 'Sony A7 IV Camera Body', status: 'active', returnDate: 'Nov 13, 2026', assignee: 'user-1.jpg' },
  { id: 'R-7791', customer: 'Priya S.', item: 'Godox SL200 III Kit', status: 'pending', returnDate: 'Nov 14, 2026', assignee: 'user-2.jpg' },
  { id: 'R-7792', customer: 'Kim T.', item: 'Epson 4K Pro Projector', status: 'overdue', returnDate: 'Nov 10, 2026', assignee: 'user-3.jpg' },
  { id: 'R-7793', customer: 'Deepak R.', item: 'Canon RF 70-200mm f/2.8', status: 'active', returnDate: 'Nov 18, 2026', assignee: 'user-1.jpg' },
  { id: 'R-7794', customer: 'Sarah L.', item: 'DJI Mavic 3 Pro', status: 'return', returnDate: 'Nov 11, 2026', assignee: 'user-2.jpg' },
]

const MOCK_INVENTORY = [
  { sku: 'CAM-A74-01', name: 'Sony A7 IV', category: 'Cameras', condition: 'good', status: 'Rented', nextAvailable: 'Nov 14' },
  { sku: 'CAM-A74-02', name: 'Sony A7 IV', category: 'Cameras', condition: 'neutral', status: 'In Stock', nextAvailable: 'Now' },
  { sku: 'LIT-GX2-01', name: 'Godox SL200 III', category: 'Lighting', condition: 'good', status: 'Rented', nextAvailable: 'Nov 15' },
  { sku: 'LNS-RF7-01', name: 'Canon RF 70-200mm', category: 'Lenses', condition: 'warning', status: 'Rented', nextAvailable: 'Nov 19' },
  { sku: 'DRN-MV3-01', name: 'DJI Mavic 3 Pro', category: 'Drones', condition: 'error', status: 'Maintenance', nextAvailable: 'TBD' },
]

/* Window Title Bar */
const WindowHeader = ({ title, children }) => (
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

/* =========================================================================
   2. ADMIN VIEWS
========================================================================= */

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
          <div className="topbar-search"><Search /> search...</div>
          <div className="user-profile"><span>Admin</span><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" alt="Profile" /></div>
        </div>
      </div>
      <div className="hero-strip">
        <div className="kpi-item"><div className="kpi-label">Active Rentals</div><div className="kpi-value">24</div><div className="kpi-sub">+3 this week</div></div>
        <div className="kpi-item"><div className="kpi-label">Revenue (Nov)</div><div className="kpi-value">₹1.2L</div><div className="kpi-sub">+12% vs Oct</div></div>
        <div className="kpi-item"><div className="kpi-label">Overdue</div><div className="kpi-value">3</div><div className="kpi-sub">needs attention</div></div>
        <div className="kpi-item"><div className="kpi-label">Pending Pickups</div><div className="kpi-value">7</div><div className="kpi-sub">2 scheduled today</div></div>
      </div>
      <div className="content-columns">
        <div className="window-card">
          <WindowHeader title="active-rentals.list"><span style={{fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)'}}>{MOCK_RENTALS.length} items</span></WindowHeader>
          <div className="window-card-body">
            {MOCK_RENTALS.slice(0,4).map(r => (
              <div className="rental-item" key={r.id}>
                <div className="rental-icon blue"><Camera size={20} /></div>
                <div className="rental-info">
                  <h4>{r.item}</h4>
                  <p>{r.customer} · {r.status === 'pending' ? 'Pickup' : 'Return'} {r.returnDate}</p>
                </div>
                <span className={`rental-status ${r.status}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="quick-actions-panel">
            <button className="quick-action-btn"><Plus size={16} /> New Rental</button>
            <button className="quick-action-btn"><Phone size={16} /> AI Call Demo</button>
            <button className="quick-action-btn"><FileText size={16} /> Generate Invoice</button>
          </div>
          <div className="window-card blue-tint">
            <WindowHeader title="november-2026.cal" />
            <div className="window-card-body">
              <div className="calendar-grid">
                {days.map((d, i) => <span key={`h-${i}`} className="calendar-day-header">{d}</span>)}
                {calendarDays.map(d => (
                  <span key={d} className={`calendar-day${d === 11 ? ' today' : ''}${d === 4 || d === 18 ? ' has-event' : ''}`}>{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Rentals View (Orders list/kanban) */
const RentalsView = () => {
  const [viewState, setViewState] = useState('list') // 'list' | 'kanban'
  const [loading, setLoading] = useState(true)
  
  React.useEffect(() => { setTimeout(() => setLoading(false), 600) }, [])

  if (loading) {
    return (
      <div className="dashboard-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="admin-spinner"></div>
      </div>
    )
  }

  return (
    <div className="dashboard-content">
      <div className="topbar">
        <h1>Rental Operations</h1>
        <div className="topbar-actions">
          <div className="view-toggles">
            <button className={`view-toggle-btn ${viewState === 'list' ? 'active' : ''}`} onClick={() => setViewState('list')}><List size={16}/> List</button>
            <button className={`view-toggle-btn ${viewState === 'kanban' ? 'active' : ''}`} onClick={() => setViewState('kanban')}><KanbanSquare size={16}/> Kanban</button>
          </div>
          <div className="topbar-search"><Search /> search...</div>
          <button className="quick-action-btn" style={{background: 'var(--blue)', color: 'var(--text-on-blue)'}}><Plus size={16} /> New Order</button>
        </div>
      </div>

      {viewState === 'list' ? (
        <div className="data-table-container">
          <WindowHeader title="orders.datatable" />
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Equipment</th>
                <th>Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_RENTALS.map(r => (
                <tr key={r.id}>
                  <td className="td-id">{r.id}</td>
                  <td className="td-main">{r.customer}</td>
                  <td className="td-sub">{r.item}</td>
                  <td className="td-sub">{r.returnDate}</td>
                  <td>
                    <span className={`status-pill ${r.status === 'active' ? 'neutral' : r.status === 'overdue' ? 'error' : r.status === 'pending' ? 'warning' : 'good'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="kanban-board">
          {['pending', 'active', 'return'].map(col => {
            const items = MOCK_RENTALS.filter(i => i.status === col)
            return (
              <div className="kanban-column" key={col}>
                <div className="kanban-col-header">
                  <span style={{textTransform: 'uppercase'}}>{col}</span>
                  <span className="kanban-badge">{items.length}</span>
                </div>
                <div className="kanban-col-body">
                  {items.map(r => (
                    <div className="kanban-card" key={r.id}>
                      <div className="k-card-header">
                        <span className="k-card-id">{r.id}</span>
                        <span className={`status-pill ${r.status === 'active' ? 'neutral' : r.status === 'pending' ? 'warning' : 'good'}`} style={{fontSize: '0.65rem', padding: '0.1rem 0.4rem'}}>
                          {r.status}
                        </span>
                      </div>
                      <div className="k-card-title">{r.customer}</div>
                      <div className="k-card-desc">{r.item}</div>
                      <div className="k-card-footer">
                        <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{r.returnDate}</span>
                        <div className="k-user">
                          <img className="k-avatar" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" alt="" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* Inventory View (Data Grid) */
const InventoryView = () => {
  const [loading, setLoading] = useState(true)
  
  React.useEffect(() => { setTimeout(() => setLoading(false), 700) }, [])

  if (loading) {
    return (
      <div className="dashboard-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="admin-spinner"></div>
      </div>
    )
  }

  return (
    <div className="dashboard-content">
      <div className="topbar">
        <h1>Inventory Control</h1>
        <div className="topbar-actions">
          <div className="topbar-search"><Search /> srch_sku...</div>
          <button className="quick-action-btn" style={{background: 'var(--blue)', color: 'var(--text-on-blue)'}}><Plus size={16} /> Add Asset</button>
        </div>
      </div>
      
      <div className="data-table-container">
        <WindowHeader title="assets_global.db" />
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU / ID</th>
              <th>Asset Name</th>
              <th>Category</th>
              <th>Health</th>
              <th>Availability</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_INVENTORY.map(inv => (
              <tr key={inv.sku}>
                <td className="td-id">{inv.sku}</td>
                <td className="td-main">{inv.name}</td>
                <td className="td-sub">{inv.category}</td>
                <td>
                  <span className={`status-pill ${inv.condition}`}>
                    {inv.condition === 'good' ? '100% OK' : inv.condition === 'neutral' ? 'Checked' : inv.condition === 'warning' ? 'Needs Insp.' : 'Repair'}
                  </span>
                </td>
                <td className="td-main" style={{fontSize: '0.85rem'}}>{inv.status} <span className="td-sub" style={{marginLeft: '0.5rem'}}>({inv.nextAvailable})</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


/* =========================================================================
   3. APP & LAYOUT
========================================================================= */

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
        <span className="nav-section-label">Operations</span>
        <Link to="/" className={`nav-item ${path === '/' ? 'active' : ''}`}><LayoutDashboard /> Overview</Link>
        <Link to="/rentals" className={`nav-item ${path === '/rentals' ? 'active' : ''}`}><Folder /> Rentals</Link>
        <Link to="/inventory" className={`nav-item ${path === '/inventory' ? 'active' : ''}`}><Box /> Inventory</Link>
        
        <span className="nav-section-label">Communications</span>
        <Link to="/messages" className={`nav-item ${path === '/messages' ? 'active' : ''}`}><MessageSquare /> Messages</Link>
        <Link to="/customers" className={`nav-item ${path === '/customers' ? 'active' : ''}`}><Users /> Customers</Link>
        
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
              <Route path="/rentals" element={<RentalsView />} />
              <Route path="/inventory" element={<InventoryView />} />
            </Routes>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
