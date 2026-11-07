import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { addProduct } from '../api.js';

export default function AddProduct() {
  const isAdmin = localStorage.getItem('is_admin') === 'true';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
  });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);

    try {
      await addProduct({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
      });

      setNotice(`Product "${formData.name}" added successfully!`);
      setFormData({ name: '', description: '', price: '', stock: '' });
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div style={styles.card}>
        <h2 style={styles.title}>Admin Access Required</h2>
        <p style={styles.text}>
          You must be logged in as an administrator to add new products.
        </p>
        <Link to="/login" style={styles.loginLink}>
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Add New Product</h2>

      {notice && <div style={styles.notice}>{notice}</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSave} style={styles.form}>
        <div style={styles.group}>
          <label style={styles.label}>Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Leather Oxford Shoes"
            style={styles.input}
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Brief details about the product"
            style={styles.textarea}
          />
        </div>

        <div style={styles.row}>
          <div style={styles.groupFlex}>
            <label style={styles.label}>Price ($) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              placeholder="89.99"
              style={styles.input}
            />
          </div>

          <div style={styles.groupFlex}>
            <label style={styles.label}>Initial Stock *</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              required
              placeholder="25"
              style={styles.input}
            />
          </div>
        </div>

        <button type="submit" disabled={submitting} style={styles.submitBtn}>
          {submitting ? 'Saving...' : 'Save Product'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  card: {
    maxWidth: '520px',
    margin: '30px auto',
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '22px',
    fontWeight: '700',
    color: '#111827',
  },
  text: {
    color: '#6b7280',
    marginBottom: '16px',
    fontSize: '15px',
  },
  loginLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '600',
  },
  notice: {
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '20px',
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
  textarea: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '15px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
};
