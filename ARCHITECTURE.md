# Architecture

## 1. System Flow
`ReactJS (Website Frontend)` -> `FastAPI (Python Server Backend)` -> `Neon PostgreSQL (Cloud Database)`

- **Login check:** Done in `auth.py` and route dependencies by validating the JWT Bearer token on protected endpoints.
- **Business logic:** Products, cart, and orders logic is handled in `backend/routes/`.

## 2. Backend Files
- `backend/main.py`: Creates the FastAPI app, configures CORS, and includes routers.
- `backend/database.py`: Manages the Neon PostgreSQL engine, session maker, and database dependency.
- `backend/models.py`: Defines the SQLAlchemy database tables.
- `backend/schemas.py`: Defines Pydantic schemas for request validation and response shapes.
- `backend/auth.py`: Handles password hashing, JWT token creation, and current user retrieval.
- `backend/routes/auth_routes.py`: Endpoints for user registration and login.
- `backend/routes/product_routes.py`: Endpoints for listing products and adding products (admin only).
- `backend/routes/cart_routes.py`: Endpoints for adding items to cart and viewing the cart.
- `backend/routes/order_routes.py`: Endpoints for placing an order and viewing user order history.

## 3. Database Tables
- `users`: User accounts (`id`, `name`, `email`, `hashed_password`, `is_admin`, `created_at`).
- `products`: Product catalog (`id`, `name`, `description`, `price`, `stock`, `created_at`).
- `cart`: Shopping carts linked to a user (`id`, `user_id`, `created_at`).
- `cart_items`: Items inside a cart (`id`, `cart_id`, `product_id`, `quantity`).
- `orders`: Placed orders with delivery details (`id`, `user_id`, `full_name`, `phone`, `address`, `city`, `postal_code`, `total_price`, `status`, `created_at`).
- `order_items`: Snapshot of items in an order (`id`, `order_id`, `product_id`, `quantity`, `price_at_purchase`).

## 4. Place Order Logic
When placing an order, a single transaction turns the active cart into an order, records the delivery details, reduces the product stock count, and empties the cart items all together.

## 5. API List
- `GET /health` - Health check endpoint
- `POST /api/register` - name, email, password
- `POST /api/login` - email, password; returns access_token and is_admin
- `GET /api/products` - List all products
- `POST /api/products` (admin only) - name, description, price, stock
- `POST /api/cart` - product_id, quantity
- `GET /api/cart` - items and total
- `POST /api/orders` - full_name, phone, address, city, postal_code
- `GET /api/orders` - the user's own orders, newest first
- `POST /api/chat` (logged-in users only) - question; returns answer
- Errors: `{"detail": "short message"}`
*(Note: There are no admin order APIs)*

---

## 6. Shop Assistant Architecture

### 6.1 Question Flow
`Chat Page (Frontend)` -> `POST /api/chat (Backend API)` -> `Orchestrator Agent (Groq via LangGraph)` -> `Specialist Agent (Product Search, Cart, or Order)` -> `Shop Data (Neon PostgreSQL via SQLAlchemy)` -> `Answer Back to User`

### 6.2 Agent Data Access & Isolation
- **Orchestrator Agent:** Receives `user id`, `role`, `request id`, and `question`. Evaluates intent and routes to the specialist agent. **Never reads or writes to the database directly.**
- **Product Search Agent:** Read-only access to `products` (names, descriptions, prices, stock).
- **Cart Agent:** Read/write access strictly scoped to the logged-in user's own `cart` and `cart_items` (view cart, add item ensuring quantity never exceeds stock).
- **Order Agent:** Read-only access strictly scoped to the logged-in user's own `orders` and `order_items` (views order history and status; never creates orders).

