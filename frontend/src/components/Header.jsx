import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('is_admin') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('is_admin');
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          SimpleShop
        </Link>
        <nav style={styles.nav}>
          <Link to="/" style={styles.link}>
            Products
          </Link>
          <Link to="/cart" style={styles.link}>
            Cart
          </Link>
          <Link to="/orders" style={styles.link}>
            My Orders
          </Link>
          <Link to="/chat" style={styles.link}>
            Chat
          </Link>
          <Link to="/admin/add-product" style={styles.link}>
            Add Product
          </Link>
          {token ? (
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" style={styles.link}>
                Login
              </Link>
              <Link to="/register" style={styles.registerLink}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  logo: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    textDecoration: 'none',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  link: {
    color: '#4b5563',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '14px',
  },
  registerLink: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '14px',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#4b5563',
    fontWeight: '500',
    fontSize: '14px',
  },
};
