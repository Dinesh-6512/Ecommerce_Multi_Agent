import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../api.js';

export default function MyOrders() {
  const token = localStorage.getItem('token');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function loadOrders() {
      try {
        const data = await getMyOrders();
        setOrders(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load order history');
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [token]);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (!token) {
    return (
      <div style={styles.card}>
        <h2 style={styles.title}>My Orders</h2>
        <div style={styles.emptyCard}>
          <p>Please log in to view your order history.</p>
          <Link to="/login" style={styles.loginLink}>
            Login to Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>My Orders</h2>

      {error && <div style={styles.errorBox}>{error}</div>}

      {loading ? (
        <div style={styles.loading}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={styles.emptyCard}>
          <p>You have not placed any orders yet.</p>
          <Link to="/" style={styles.shopLink}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div style={styles.ordersList}>
          {orders.map((order) => (
            <div key={order.id} style={styles.orderCard}>
              <div style={styles.headerRow}>
                <div>
                  <span style={styles.orderId}>Order #{order.id}</span>
                  <span style={styles.orderDate}> • {formatDate(order.created_at)}</span>
                </div>
                <span style={styles.statusBadge}>{order.status}</span>
              </div>

              <div style={styles.body}>
                <div style={styles.itemsSection}>
                  <h4 style={styles.subTitle}>Items Ordered:</h4>
                  <ul style={styles.itemList}>
                    {order.items.map((item) => (
                      <li key={item.id} style={styles.itemRow}>
                        <span>
                          {item.product_name} × {item.quantity}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={styles.detailsSection}>
                  <h4 style={styles.subTitle}>Delivery Address:</h4>
                  <p style={styles.detailText}>
                    <strong>{order.full_name}</strong> ({order.phone})
                  </p>
                  <p style={styles.detailText}>
                    {order.address}, {order.city}, {order.postal_code}
                  </p>
                </div>
              </div>

              <div style={styles.footerRow}>
                <span style={styles.totalLabel}>Total:</span>
                <span style={styles.totalPrice}>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          ))}
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
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    padding: '40px',
    textAlign: 'center',
    color: '#6b7280',
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
  shopLink: {
    display: 'inline-block',
    marginTop: '12px',
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '600',
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
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  orderId: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
  },
  orderDate: {
    fontSize: '14px',
    color: '#6b7280',
  },
  statusBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  body: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '16px',
  },
  itemsSection: {},
  detailsSection: {},
  subTitle: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  itemList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#374151',
  },
  detailText: {
    margin: '2px 0',
    fontSize: '14px',
    color: '#4b5563',
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'baseline',
    gap: '8px',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '12px',
  },
  totalLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4b5563',
  },
  totalPrice: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#111827',
  },
};
