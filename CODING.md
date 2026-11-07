# Backend Code Structure

This document outlines the backend files and the specific role of each:

- `backend/.env`: Holds local secrets and configuration (`DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`).
- `backend/requirements.txt`: Lists all Python library dependencies required to run the server.
- `backend/__init__.py`: Marks the `backend` folder as a Python package.
- `backend/database.py`: Establishes the Neon PostgreSQL connection, SQLAlchemy engine, session maker, and database dependency.
- `backend/models.py`: Defines the SQLAlchemy database tables (`users`, `products`, `cart`, `cart_items`, `orders`, `order_items`).
- `backend/schemas.py`: Contains Pydantic models for incoming request bodies and outgoing response schemas.
- `backend/auth.py`: Implements password hashing with bcrypt, JWT token creation/decoding with PyJWT, HTTPBearer authorization, and current user/admin retrieval.
- `backend/main.py`: Entry point that creates the FastAPI application, sets up CORS middleware, registers routers, handles database table creation and demo data seeding on startup, and serves the health check endpoint.
- `backend/routes/__init__.py`: Marks the `backend/routes` folder as a Python package.
- `backend/routes/auth_routes.py`: Defines the `/api/register` and `/api/login` endpoints.
- `backend/routes/product_routes.py`: Defines the product catalog endpoints (`GET /api/products` and admin `POST /api/products`).
- `backend/routes/cart_routes.py`: Defines the shopping cart endpoints (`POST /api/cart` and `GET /api/cart`).
- `backend/routes/order_routes.py`: Defines order placement and history endpoints (`POST /api/orders` and `GET /api/orders`).
- `backend/routes/chat_routes.py`: Defines the chat endpoint (`POST /api/chat`) protected for authenticated users and admins.
- `backend/ai_agent/__init__.py`: Marks the `backend/ai_agent` folder as a Python package.
- `backend/ai_agent/llm.py`: Configures the Groq Chat model with credentials from `backend/.env` and `llm_temperature = 0`.
- `backend/ai_agent/state.py`: Defines the typed dictionary for the shared agent state (`user_id`, `role`, `request_id`, `question`, etc.).
- `backend/ai_agent/orchestrator.py`: Orchestrator agent logic that classifies intent and delegates to specialists.
- `backend/ai_agent/product_search_agent.py`: Specialist agent for product queries (read-only catalog and stock).
- `backend/ai_agent/cart_agent.py`: Specialist agent for viewing and adding items to the current user's cart.
- `backend/ai_agent/order_agent.py`: Specialist agent for viewing the current user's past orders.
- `backend/ai_agent/monitoring.py`: Manages Langfuse connection check, tracing observers, LangChain callback handler, metadata recording, and evaluation scoring.

