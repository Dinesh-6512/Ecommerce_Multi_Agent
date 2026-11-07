import React from 'react';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <p style={styles.text}>© SimpleShop. Built with ReactJS, FastAPI, and Neon PostgreSQL.</p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e5e7eb',
    marginTop: 'auto',
    padding: '24px 20px',
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    textAlign: 'center',
  },
  text: {
    color: '#6b7280',
    fontSize: '14px',
    margin: 0,
  },
};

