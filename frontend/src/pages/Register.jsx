import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api.js';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser({ name, email, password });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Create an Account</h2>

      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.group}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="John Doe"
            style={styles.input}
          />
        </div>
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
            placeholder="Create password"
            style={styles.input}
          />
        </div>
        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <p style={styles.switchText}>
        Already have an account?{' '}
        <Link to="/login" style={styles.switchLink}>
          Login here
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
