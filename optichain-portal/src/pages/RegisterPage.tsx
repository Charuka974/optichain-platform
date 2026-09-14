import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const ROLES = [
  { value: 'analyst',   label: 'Supply Chain Analyst',   desc: 'Analyse shipment risk and track deliveries' },
  { value: 'manager',   label: 'Logistics Manager',       desc: 'Manage routes, teams and KPIs' },
  { value: 'executive', label: 'Executive / C-Suite',     desc: 'High-level dashboards and strategic insights' },
  { value: 'user',      label: 'General User',            desc: 'Basic access and predictions' },
];

export default function RegisterPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [role,     setRole]     = useState('analyst');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  function validate() {
    const e: Record<string, string> = {};
    if (!email)    e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'At least 8 characters required';
    if (confirm !== password) e.confirm = 'Passwords do not match';
    if (!role) e.role = 'Please select a role';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.register({ email, password, role });
      login(res.access_token, email, role);
      showToast('success', 'Account created!', 'Welcome to OptiChain.');
      navigate('/predict');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Registration failed. Please try again.';
      showToast('error', 'Registration failed', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.glow1} />
      <div style={styles.glow2} />

      <div style={styles.card} className="animate-fade-in-up">
        {/* Header */}
        <div style={styles.cardHeader}>
          <div style={styles.logoWrap}>
            <div style={styles.logoIcon}>
              <Activity size={24} color="#fff" strokeWidth={2.5} />
            </div>
          </div>
          <h1 style={styles.title}>Create account</h1>
          <p style={styles.subtitle}>Join OptiChain – Supply Chain AI Platform</p>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="form-label">Email address</label>
            <div style={styles.inputWrap}>
              <Mail size={15} style={styles.inputIcon} />
              <input
                id="reg-email"
                type="email"
                className={`form-input${errors.email ? ' error' : ''}`}
                style={{ paddingLeft: '38px' }}
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                autoComplete="email"
              />
            </div>
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="form-label">Password</label>
            <div style={styles.inputWrap}>
              <Lock size={15} style={styles.inputIcon} />
              <input
                id="reg-password"
                type={showPwd ? 'text' : 'password'}
                className={`form-input${errors.password ? ' error' : ''}`}
                style={{ paddingLeft: '38px', paddingRight: '40px' }}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPwd((v) => !v)} style={styles.eyeBtn} aria-label="Toggle password">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          {/* Confirm */}
          <div>
            <label htmlFor="reg-confirm" className="form-label">Confirm password</label>
            <div style={styles.inputWrap}>
              <Lock size={15} style={styles.inputIcon} />
              <input
                id="reg-confirm"
                type={showPwd ? 'text' : 'password'}
                className={`form-input${errors.confirm ? ' error' : ''}`}
                style={{ paddingLeft: '38px' }}
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: '' })); }}
                autoComplete="new-password"
              />
            </div>
            {errors.confirm && <div className="form-error">{errors.confirm}</div>}
          </div>

          {/* Role */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Shield size={13} /> Select your role
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  htmlFor={`role-${r.value}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: `1px solid ${role === r.value ? 'rgba(59,110,248,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    background: role === r.value ? 'rgba(59,110,248,0.1)' : 'rgba(21,29,53,0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    id={`role-${r.value}`}
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    style={{ marginTop: '3px', accentColor: '#3b6ef8' }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: role === r.value ? '#c0d4ff' : '#94a3b8' }}>{r.label}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '1px' }}>{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.role && <div className="form-error">{errors.role}</div>}
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '4px' }}
          >
            {loading ? (
              <><div className="spinner" />Creating account…</>
            ) : (
              <>Create Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{' '}
          <Link to="/login" id="go-to-login-link" style={styles.link}>Sign in</Link>
        </p>
      </div>

      <div style={styles.brand}>
        <Activity size={13} color="#3b6ef8" />
        <span>OptiChain · Supply Chain AI Platform</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '24px',
    position: 'relative', overflow: 'hidden',
    background: 'var(--gradient-hero)',
  },
  glow1: {
    position: 'absolute', top: '-200px', left: '50%',
    transform: 'translateX(-50%)',
    width: '700px', height: '700px',
    background: 'radial-gradient(circle, rgba(59,110,248,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  glow2: {
    position: 'absolute', bottom: '-200px', right: '-100px',
    width: '500px', height: '500px',
    background: 'radial-gradient(circle, rgba(109,76,247,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%', maxWidth: '480px',
    background: 'rgba(15, 22, 41, 0.85)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '36px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
    position: 'relative', zIndex: 1,
  },
  cardHeader: { textAlign: 'center', marginBottom: '28px' },
  logoWrap:   { display: 'flex', justifyContent: 'center', marginBottom: '16px' },
  logoIcon: {
    width: '52px', height: '52px', borderRadius: '14px',
    background: 'linear-gradient(135deg, #3b6ef8 0%, #6d4cf7 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 28px rgba(59,110,248,0.4)',
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '24px', fontWeight: '700',
    color: '#f1f5f9', letterSpacing: '-0.025em', marginBottom: '5px',
  },
  subtitle: { fontSize: '14px', color: '#64748b' },
  inputWrap: { position: 'relative' },
  inputIcon: {
    position: 'absolute', left: '12px', top: '50%',
    transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none',
  },
  eyeBtn: {
    position: 'absolute', right: '12px', top: '50%',
    transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: '#64748b',
    cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center',
  },
  footerText: { textAlign: 'center', fontSize: '13.5px', color: '#64748b', marginTop: '24px' },
  link:       { color: '#93b4ff', textDecoration: 'none', fontWeight: '600' },
  brand: {
    display: 'flex', alignItems: 'center', gap: '6px',
    marginTop: '28px', fontSize: '12px', color: '#475569',
    position: 'relative', zIndex: 1,
  },
};
