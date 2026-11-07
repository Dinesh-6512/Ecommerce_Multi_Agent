import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { getProducts, addToCart } from '../api.js';

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await addToCart({ product_id: product.id, quantity: 1 });
      setNotice(`Added "${product.name}" to cart!`);
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      setNotice(`Error: ${err.message}`);
      setTimeout(() => setNotice(''), 4000);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Welcome to SimpleShop</h1>
        <p style={styles.heroSubtitle}>Find your favorite pair of sneakers with ease.</p>
      </div>

      {notice && <div style={styles.notice}>{notice}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={styles.loading}>Loading products...</div>
      ) : products.length === 0 ? (
        <div style={styles.empty}>No products available right now.</div>
      ) : (
        <div style={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px 0',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  heroTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  heroSubtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0,
  },
  notice: {
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: '500',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  loading: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '40px',
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
};
