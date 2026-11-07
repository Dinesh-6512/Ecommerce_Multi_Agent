# UI/UX Specifications

## Shared Layout
- **Header:** Site logo/title ("SimpleShop"), navigation links (Products, Cart, My Orders, Chat, Add Product [if admin], Login/Register or Logout).
- **Footer:** Simple copyright notice.

---

## Account Screens

### 1. Register Screen (`/register`)
- **What the user sees:** Form with Email and Password inputs, and a "Register" button. Link to Login screen.
- **What the user can do:** Enter credentials, click "Register".
- **Where the user goes next:** On success, redirected to Login screen.

### 2. Login Screen (`/login`)
- **What the user sees:** Form with Email and Password inputs, and a "Login" button. Link to Register screen.
- **What the user can do:** Enter credentials, click "Login".
- **Where the user goes next:** On success, token and admin status are saved; redirected to Products screen.

---

## User Screens

### 3. Products Screen (`/` or `/products`)
- **What the user sees:** A grid/list of product cards showing Title, Description, and Price. Each card has an "Add to Cart" button.
- **What the user can do:** Browse items, click "Add to Cart" on any product.
- **Where the user goes next:** Remains on screen with an item-added confirmation, or clicks "Cart" in the header.

### 4. Cart Screen (`/cart`)
- **What the user sees:** Table/list of cart items with Title, Unit Price, Quantity, and Line Total. Cart Grand Total at the bottom. A "Proceed to Checkout" button.
- **What the user can do:** Review items and total cost, click "Proceed to Checkout".
- **Where the user goes next:** Proceeds to the Checkout screen (`/checkout`).

### 5. Checkout Screen (`/checkout`)
- **What the user sees:** Delivery details form (Full Name, Phone, Address, City, Postal Code), Order Summary showing grand total, and a "Place Order" button.
- **What the user can do:** Fill in required delivery information and click "Place Order".
- **Where the user goes next:** On successful submission, sees a brief success message and is redirected to My Orders (`/orders`).

### 6. My Orders Screen (`/orders`)
- **What the user sees:** List of past orders ordered by date. Each order card shows Order ID, Date, Status ("placed"), Delivery Details (Name, Phone, Address, City, Postal Code), ordered items with quantities, and Total Price.
- **What the user can do:** Review past purchases.
- **Where the user goes next:** Can click "Products" in the header to continue shopping.

---

## Admin Screen

### 7. Add Product Screen (`/admin/add-product`)
- **What the user sees:** Admin-only form with Title, Description, and Price fields, plus an "Add Product" button.
- **What the user can do:** Enter product details and click "Add Product".
- **Where the user goes next:** On success, shows a confirmation message and clears the form or redirects to the Products list.

---

## 8. Shop Assistant Screen (`/chat`)
- **What the user sees:**
  - Navigation: "Chat" link visible in the header menu.
  - Chat Area: Scrollable conversation window displaying user messages and assistant replies in matching clean card styling.
  - Message Input Box: Text input field with placeholder "Ask about products, your cart, or orders...".
  - Send Button: "Send" button next to input (disabled when empty or loading).
  - Loading State: Shows "Assistant is thinking..." while the agent is processing.
- **What the user can do:** Type questions about shop products, cart contents, or order history, and click "Send".
- **Assistant Responses:**
  - **No data found:** *"Sorry, I couldn't find any items matching that in our shop."*
  - **Unclear question:** *"Could you please provide a few more details so I can assist you?"*
  - **Refused question:** *"I can only help with questions about our shop's products, your cart, or your orders."*
  - **Error handling:** *"Sorry, something went wrong. Please try again later."* (Never reveals stack traces, secrets, or internal details).
- **Where the user goes next:** Continues chatting or navigates to Products, Cart, or Orders via header links.

