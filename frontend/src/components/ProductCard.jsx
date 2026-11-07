import React from 'react';

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.name}>{product.name}</h3>
      <p style={styles.description}>{product.description}</p>
      <div style={styles.footer}>
        <span style={styles.price}>${Number(product.price).toFixed(2)}</span>
        <button
          onClick={() => onAddToCart && onAddToCart(product)}
          style={styles.addBtn}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  name: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    color: '#6b7280',
    flex: 1,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  price: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
  },
  addBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

