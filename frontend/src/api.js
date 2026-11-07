const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data && data.detail ? data.detail : 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function registerUser({ name, email, password }) {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginUser({ email, password }) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getProducts() {
  return request('/products', {
    method: 'GET',
  });
}

export async function addProduct({ name, description, price, stock }) {
  return request('/products', {
    method: 'POST',
    body: JSON.stringify({ name, description, price, stock }),
  });
}

export async function getCart() {
  return request('/cart', {
    method: 'GET',
  });
}

export async function addToCart({ product_id, quantity = 1 }) {
  return request('/cart', {
    method: 'POST',
    body: JSON.stringify({ product_id, quantity }),
  });
}

export async function placeOrder({ full_name, phone, address, city, postal_code }) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify({ full_name, phone, address, city, postal_code }),
  });
}

export async function getMyOrders() {
  return request('/orders', {
    method: 'GET',
  });
}

export async function sendChatMessage(question) {
  return request('/chat', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}

