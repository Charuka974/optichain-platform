import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, BarChart2, Clock, LayoutDashboard, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    showToast('info', 'Logged out', 'See you next time!');
    navigate('/login');
  }

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    color: isActive ? '#c0d4ff' : '#94a3b8',
    background: isActive ? 'rgba(59, 110, 248, 0.15)' : 'transparent',
    border: isActive ? '1px solid rgba(59, 110, 248, 0.25)' : '1px solid transparent',
  });

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 15, 30, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Logo */}
        <NavLink
          to="/predict"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #3b6ef8 0%, #6d4cf7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(59,110,248,0.4)',
            }}
          >
            <Activity size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: '700',
                fontSize: '18px',
                color: '#fff',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              OptiChain
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.08em', fontWeight: '500' }}>
              SUPPLY CHAIN AI
            </div>
          </div>
        </NavLink>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
          <NavLink to="/predict" style={navLinkStyle}>
            <BarChart2 size={15} />
            Predict
          </NavLink>
          <NavLink to="/history" style={navLinkStyle}>
            <Clock size={15} />
            History
          </NavLink>
          <NavLink to="/dashboard" style={navLinkStyle}>
            <LayoutDashboard size={15} />
            Dashboard
          </NavLink>
        </nav>

        {/* User area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user && (
            <div style={{ position: 'relative' }}>
              <button
                id="user-menu-btn"
                onClick={() => setUserMenuOpen((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  fontSize: '13px',
                  transition: 'all 0.2s ease',
                }}
                aria-label="User menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b6ef8, #6d4cf7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </span>
                <ChevronDown size={13} style={{ transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
              </button>

              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: 'rgba(15, 22, 41, 0.97)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '8px',
                    minWidth: '200px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(16px)',
                    zIndex: 200,
                    animation: 'fadeInUp 0.2s ease',
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Signed in as</div>
                    <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500', wordBreak: 'break-all' }}>{user.email}</div>
                    <div style={{ fontSize: '11px', color: '#6d4cf7', marginTop: '2px', textTransform: 'capitalize', fontWeight: '600' }}>{user.role}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    id="header-logout-btn"
                    className="btn-danger"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="btn-ghost mobile-nav-toggle"
            aria-label="Toggle menu"
            style={{ display: 'none' }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div
          style={{
            background: 'rgba(10, 15, 30, 0.97)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <NavLink to="/predict" style={navLinkStyle} onClick={() => setMobileOpen(false)}>
            <BarChart2 size={15} /> Predict
          </NavLink>
          <NavLink to="/history" style={navLinkStyle} onClick={() => setMobileOpen(false)}>
            <Clock size={15} /> History
          </NavLink>
          <NavLink to="/dashboard" style={navLinkStyle} onClick={() => setMobileOpen(false)}>
            <LayoutDashboard size={15} /> Dashboard
          </NavLink>
          <button onClick={handleLogout} className="btn-danger" style={{ marginTop: '8px' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 700px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-toggle { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
