import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api.js';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillDemoUser = () => {
    setEmail('user@shop.com');
    setPassword('User@123');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@shop.com');
    setPassword('Admin@123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser({ email, password });
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('is_admin', String(data.is_admin));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Login to SimpleShop</h2>

      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.group}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={styles.input}
          />
        </div>
        <div style={styles.group}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
            style={styles.input}
          />
        </div>
        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={styles.demoSection}>
        <p style={styles.demoTitle}>Quick Fill for Learning:</p>
        <div style={styles.demoButtons}>
          <button type="button" onClick={fillDemoUser} style={styles.demoBtn}>
            Use demo user
          </button>
          <button type="button" onClick={fillDemoAdmin} style={styles.demoBtn}>
            Use demo admin
          </button>
        </div>
        <div style={styles.demoNote}>
          <p style={styles.noteLine}><strong>Demo User:</strong> user@shop.com / User@123</p>
          <p style={styles.noteLine}><strong>Demo Admin:</strong> admin@shop.com / Admin@123</p>
        </div>
      </div>

      <p style={styles.switchText}>
        Don't have an account?{' '}
        <Link to="/register" style={styles.switchLink}>
          Register here
        </Link>
      </p>
    </div>
  );
}

const styles = {
  card: {
    maxWidth: '420px',
    margin: '40px auto',
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
  },
  title: {
    margin: '0 0 24px 0',
    fontSize: '22px',
    fontWeight: '700',
    textAlign: 'center',
    color: '#111827',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '10px 14px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '15px',
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  demoSection: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
  },
  demoTitle: {
    margin: '0 0 10px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#4b5563',
  },
  demoButtons: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  demoBtn: {
    flex: 1,
    padding: '8px 10px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  demoNote: {
    fontSize: '12px',
    color: '#6b7280',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '8px',
  },
  noteLine: {
    margin: '4px 0',
  },
  switchText: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#4b5563',
  },
  switchLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
  },
};
