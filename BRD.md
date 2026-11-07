# Business Requirements Document (BRD)

## 1. Project Goal & Users
Build a simple, beginner-friendly e-commerce website for purchasing products online.
- **Roles:**
  - **User (Shopper):** Browses products, manages a cart, and places orders.
  - **Admin (Store Owner):** Adds new products to the catalog.

## 2. Features

### User Features
- **Register:** Create a new customer account with email and password.
- **Login:** Authenticate and receive a session token.
- **View Products:** Browse a list of all available items (title, description, price).
- **Add to Cart:** Add items with desired quantity to the shopping cart.
- **View Cart:** See selected items, quantities, item prices, and subtotal.
- **Checkout:** Provide delivery details (full name, phone, address, city, postal code).
- **Place Order:** Convert the current cart into a placed order.
- **View My Orders:** See past orders with delivery details, item summary, and total cost.

### Admin Features
- **Add Product:** Form to create a new product (title, description, price).

## 3. Scope Exclusions (Not Included)
- No online payment gateway (cash on delivery / dummy checkout).
- No search bar or product filtering.
- No separate product details page.
- No categories or tags.
- No editing or deleting products.
- No removing items from the cart.
- No order cancellation or returns.
- No admin order management dashboard.

## 4. Main User Journey
- **User:** Register -> Login -> View products -> Add to cart -> View cart -> Checkout -> Place order -> View my orders
- **Admin:** Login -> Add product -> Verify product appears in catalog

## 5. Success Criteria
- Users can successfully register and log in to receive an authorization token.
- Catalog items display accurate titles and prices.
- Items added to cart persist for the user and calculate totals correctly.
- Order submission saves delivery details and clears the active cart.
- Order history accurately lists previously placed orders for the logged-in user.
- Admin-created products immediately appear in the product catalog.

---

## 6. Shop Assistant (AI Agent)

An intelligent conversational assistant available on a dedicated chat page that answers customer questions using real shop data.

### 6.1 The 4 Agents
1. **Orchestrator Agent:** Reads the user question, routes it to the correct specialist agent, and delivers the final answer (never accesses the database directly).
2. **Product Search Agent:** Only looks up products, descriptions, prices, and available stock.
3. **Cart Agent:** Only views the logged-in user's cart and adds items (never exceeding available stock).
4. **Order Agent:** Only views the logged-in user's own orders and order status (never places orders; instructs users to use the Checkout page).

### 6.2 Allowed Actions
- Product, price, and stock queries.
- Viewing the logged-in user's own cart.
- Adding an available product to the logged-in user's own cart (within stock limits).
- Viewing the logged-in user's own order history and status.

### 6.3 Not Allowed Actions
- Placing orders (users must be guided to the Checkout page).
- Modifying existing cart items, removing cart items, or applying discounts.
- Cancelling or modifying existing orders.
- Accessing or revealing any other user's data or administrative data.

### 6.4 User Flow
`Open Chat Page` -> `Type / Ask a Question` -> `Receive Answer from Real Shop Data`

### 6.5 Success Rules
- **Data Accuracy:** Never invent products, prices, or orders; if data is not found, clearly state so.
- **Stock Enforcement:** Cart additions strictly enforce stock availability (never allow quantity exceeding stock).
- **Scope & Safety:** Unclear questions prompt the user for clarification; non-shop questions are politely refused; secrets and internal error details are never exposed.
- **Order Boundary:** Any request to place an order clearly instructs the user to complete checkout on the Checkout page.

