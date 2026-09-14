import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  function validate() {
    const e: Record<string, string> = {};
    if (!email)    e.email    = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      login(res.access_token, email);
      showToast('success', 'Welcome back!', `Signed in as ${email}`);
      navigate('/predict');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Invalid credentials. Please try again.';
      showToast('error', 'Login failed', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Background glow */}
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
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Sign in to your OptiChain account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email */}
          <div>
            <label htmlFor="login-email" className="form-label">Email address</label>
            <div style={styles.inputWrap}>
              <Mail size={15} style={styles.inputIcon} />
              <input
                id="login-email"
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
            <label htmlFor="login-password" className="form-label">Password</label>
            <div style={styles.inputWrap}>
              <Lock size={15} style={styles.inputIcon} />
              <input
                id="login-password"
                type={showPwd ? 'text' : 'password'}
                className={`form-input${errors.password ? ' error' : ''}`}
                style={{ paddingLeft: '38px', paddingRight: '40px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                style={styles.eyeBtn}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          {/* Submit */}
          <button
            id="login-submit-btn"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '4px' }}
          >
            {loading ? (
              <><div className="spinner" />Signing in…</>
            ) : (
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        {/* Footer link */}
        <p style={styles.footerText}>
          Don't have an account?{' '}
          <Link to="/register" id="go-to-register-link" style={styles.link}>
            Create one
          </Link>
        </p>
      </div>

      {/* Brand badge */}
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
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
    width: '100%',
    maxWidth: '440px',
    background: 'rgba(15, 22, 41, 0.85)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '40px 36px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
    position: 'relative',
    zIndex: 1,
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  logoIcon: {
    width: '56px', height: '56px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #3b6ef8 0%, #6d4cf7 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 28px rgba(59,110,248,0.45)',
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '26px',
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: '-0.025em',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
  },
  inputWrap: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b',
    pointerEvents: 'none',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '13.5px',
    color: '#64748b',
    marginTop: '24px',
  },
  link: {
    color: '#93b4ff',
    textDecoration: 'none',
    fontWeight: '600',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '32px',
    fontSize: '12px',
    color: '#475569',
    position: 'relative',
    zIndex: 1,
  },
};
