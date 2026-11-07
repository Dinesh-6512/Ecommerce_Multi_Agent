import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCart, placeOrder } from '../api.js';

export default function Checkout() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
        setError(err.message || 'Failed to load cart summary');
      } finally {
        setLoading(false);
      }
    }
    loadCart();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.postalCode.trim()
    ) {
      setError('Please fill in all delivery details.');
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      setError('Your cart is empty. Add products before checking out.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await placeOrder({
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        postal_code: formData.postalCode.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div style={styles.card}>
        <h2 style={styles.title}>Checkout</h2>
        <div style={styles.emptyCard}>
          <p>Please log in to proceed to checkout.</p>
          <Link to="/login" style={styles.loginLink}>
            Login to Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Checkout</h2>

      {error && <div style={styles.errorBox}>{error}</div>}
      {success && (
        <div style={styles.successBox}>
          Order placed successfully! Redirecting to My Orders...
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>Loading order details...</div>
      ) : cart.items.length === 0 && !success ? (
        <div style={styles.emptyCard}>
          <p>Your cart is empty. Please add items before checking out.</p>
          <Link to="/" style={styles.loginLink}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div style={styles.content}>
          {/* Delivery Details Form */}
          <div style={styles.formCard}>
            <h3 style={styles.sectionTitle}>Delivery Details</h3>
            <form onSubmit={handlePlaceOrder} style={styles.form} id="checkout-form">
              <div style={styles.group}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Jane Doe"
                  style={styles.input}
                />
              </div>

              <div style={styles.group}>
                <label style={styles.label}>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+1 555-0199"
                  style={styles.input}
                />
              </div>

              <div style={styles.group}>
                <label style={styles.label}>Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="123 Main St, Apt 4B"
                  style={styles.input}
                />
              </div>

              <div style={styles.row}>
                <div style={styles.groupFlex}>
                  <label style={styles.label}>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="Springfield"
                    style={styles.input}
                  />
                </div>

                <div style={styles.groupFlex}>
                  <label style={styles.label}>Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    placeholder="97477"
                    style={styles.input}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div style={styles.summaryCard}>
            <h3 style={styles.sectionTitle}>Order Summary</h3>
            <div style={styles.summaryList}>
              {cart.items.map((item) => (
                <div key={item.id} style={styles.summaryItem}>
                  <span>
                    {item.product_name} × {item.quantity}
                  </span>
                  <span style={styles.boldText}>
                    ${Number(item.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div style={styles.totalRow}>
              <span>Grand Total:</span>
              <span style={styles.totalAmount}>
                ${Number(cart.total).toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={submitting || success}
              style={styles.placeOrderBtn}
            >
              {submitting ? 'Placing Order...' : success ? 'Order Placed!' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
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
  loading: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '40px',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '24px',
    alignItems: 'start',
  },
  formCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  groupFlex: {
    flex: 1,
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
  summaryList: {
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#4b5563',
  },
  boldText: {
    fontWeight: '600',
    color: '#111827',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: '16px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
  },
  totalAmount: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#111827',
  },
  placeOrderBtn: {
    width: '100%',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '16px',
  },
  successBox: {
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontWeight: '600',
  },
};
