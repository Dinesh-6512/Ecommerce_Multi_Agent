import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCart } from '../api.js';

export default function Cart() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function loadCart() {
      try {
        const data = await getCart();
        setCart(data || { items: [], total: 0 });
      } catch (err) {
        setError(err.message || 'Failed to load cart');
      } finally {
        setLoading(false);
      }
    }
    loadCart();
  }, [token]);

  if (!token) {
    return (
      <div style={styles.card}>
        <h2 style={styles.title}>Your Shopping Cart</h2>
        <div style={styles.emptyCard}>
          <p>Please log in to view your shopping cart.</p>
          <Link to="/login" style={styles.loginLink}>
            Login to Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Shopping Cart</h2>

      {error && <div style={styles.errorBox}>{error}</div>}

      {loading ? (
        <div style={styles.loading}>Loading cart...</div>
      ) : cart.items.length === 0 ? (
        <div style={styles.emptyCard}>
          <p>Your cart is currently empty.</p>
          <Link to="/" style={styles.shopLink}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Product</th>
                <th style={styles.thCenter}>Quantity</th>
                <th style={styles.thRight}>Unit Price</th>
                <th style={styles.thRight}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => (
                <tr key={item.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <strong>{item.product_name}</strong>
                  </td>
                  <td style={styles.tdCenter}>{item.quantity}</td>
                  <td style={styles.tdRight}>${Number(item.price).toFixed(2)}</td>
                  <td style={styles.tdRight}>${Number(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.summarySection}>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Cart Total:</span>
              <span style={styles.totalAmount}>${Number(cart.total).toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              style={styles.checkoutBtn}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '30px auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    padding: '40px',
    textAlign: 'center',
    color: '#6b7280',
  },
  shopLink: {
    display: 'inline-block',
    marginTop: '12px',
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '600',
  },
  loginLink: {
    display: 'inline-block',
    marginTop: '12px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '500',
  },
  loading: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '40px',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    borderBottom: '2px solid #e5e7eb',
  },
  th: {
    textAlign: 'left',
    padding: '12px 8px',
    color: '#4b5563',
    fontSize: '14px',
    fontWeight: '600',
  },
  thCenter: {
    textAlign: 'center',
    padding: '12px 8px',
    color: '#4b5563',
    fontSize: '14px',
    fontWeight: '600',
  },
  thRight: {
    textAlign: 'right',
    padding: '12px 8px',
    color: '#4b5563',
    fontSize: '14px',
    fontWeight: '600',
  },
  tableRow: {
    borderBottom: '1px solid #f3f4f6',
  },
  td: {
    padding: '14px 8px',
    color: '#1f2937',
    fontSize: '15px',
  },
  tdCenter: {
    textAlign: 'center',
    padding: '14px 8px',
    color: '#1f2937',
    fontSize: '15px',
  },
  tdRight: {
    textAlign: 'right',
    padding: '14px 8px',
    color: '#1f2937',
    fontSize: '15px',
  },
  summarySection: {
    marginTop: '24px',
    borderTop: '2px solid #e5e7eb',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '16px',
  },
  totalRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
  },
  totalAmount: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#111827',
  },
  checkoutBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
