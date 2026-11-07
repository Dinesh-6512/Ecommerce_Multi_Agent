import json
import re
from backend.database import SessionLocal
from backend.models import Cart, CartItem, Product
from backend.ai_agent.llm import get_llm
from backend.ai_agent.state import AgentState
from backend.ai_agent.monitoring import observe


@observe(name="cart-agent")
def cart_node(state: AgentState) -> dict:
    user_id = state["user_id"]
    question = state["question"]

    # Use LLM to classify cart action and extract parameters
    system_prompt = (
        "You are an assistant parsing a user's shopping cart request.\n"
        "Determine if the user wants to ADD an item to their cart, or VIEW/CHECK their cart.\n"
        "Reply ONLY with a raw JSON object and no other text:\n"
        '{"action": "add" or "view", "product": "name or ID or empty string", "quantity": integer}\n'
        "If quantity is not specified for an add action, use 1."
    )

    action = "view"
    product_query = ""
    quantity = 1

    try:
        llm = get_llm()
        response = llm.invoke([
            ("system", system_prompt),
            ("human", question),
        ])
        content = response.content.strip()
        # Clean any markdown code blocks
        if content.startswith("```"):
            content = re.sub(r"^```(?:json)?\n?", "", content)
            content = re.sub(r"\n?```$", "", content)
        data = json.loads(content)
        action = data.get("action", "view").lower()
        product_query = str(data.get("product") or "").strip()
        quantity = int(data.get("quantity") or 1)
    except Exception:
        # Fallback keyword detection
        q_lower = question.lower()
        if "add" in q_lower:
            action = "add"
            digits = re.findall(r"\b\d+\b", question)
            quantity = int(digits[0]) if digits else 1
            # remove words like "add", "to", "my", "cart" to guess product
            product_query = re.sub(r"\b(add|to|my|cart|please|a|the|item|product)\b", "", q_lower).strip()
        else:
            action = "view"

    db = SessionLocal()
    try:
        if action == "add":
            if quantity <= 0:
                return {"answer": "Quantity must be at least 1."}

            product = None
            if product_query.isdigit():
                product = db.query(Product).filter(Product.id == int(product_query)).first()

            if not product and product_query:
                # Search by name match
                product = (
                    db.query(Product)
                    .filter(Product.name.ilike(f"%{product_query}%"))
                    .first()
                )

            if not product:
                return {"answer": "Sorry, I couldn't find that product in our shop."}

            user_cart = db.query(Cart).filter(Cart.user_id == user_id).first()
            if not user_cart:
                user_cart = Cart(user_id=user_id)
                db.add(user_cart)
                db.commit()
                db.refresh(user_cart)

            existing_item = (
                db.query(CartItem)
                .filter(CartItem.cart_id == user_cart.id, CartItem.product_id == product.id)
                .first()
            )

            current_qty = existing_item.quantity if existing_item else 0
            new_total_qty = current_qty + quantity

            # max_stock_rule: a cart quantity can never be above the stock
            if new_total_qty > product.stock:
                return {
                    "answer": (
                        f"Cannot add {quantity} '{product.name}' to your cart. "
                        f"Only {product.stock} available in stock (you currently have {current_qty} in cart)."
                    )
                }

            if existing_item:
                existing_item.quantity = new_total_qty
            else:
                new_item = CartItem(
                    cart_id=user_cart.id,
                    product_id=product.id,
                    quantity=quantity,
                )
                db.add(new_item)

            db.commit()
            return {
                "answer": (
                    f"Added {quantity} '{product.name}' to your cart. "
                    f"You now have {new_total_qty} in your cart."
                )
            }

        # View cart action
        user_cart = db.query(Cart).filter(Cart.user_id == user_id).first()
        if not user_cart or not user_cart.items:
            return {"answer": "Your cart is currently empty."}

        lines = []
        total = 0.0
        for item in user_cart.items:
            subtotal = round(item.quantity * item.product.price, 2)
            total += subtotal
            lines.append(f"- {item.product.name} (Qty: {item.quantity}) - ${subtotal:.2f}")

        return {
            "answer": (
                "Your cart:\n"
                + "\n".join(lines)
                + f"\n\nTotal: ${total:.2f}"
            )
        }

    except Exception:
        db.rollback()
        return {"answer": "Sorry, something went wrong while accessing your cart. Please try again."}
    finally:
        db.close()
