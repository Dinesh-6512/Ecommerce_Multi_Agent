import re
from backend.database import SessionLocal
from backend.models import Order
from backend.ai_agent.llm import get_llm
from backend.ai_agent.state import AgentState
from backend.ai_agent.monitoring import observe


@observe(name="order-agent")
def order_node(state: AgentState) -> dict:
    user_id = state["user_id"]
    question = state["question"]
    q_lower = question.lower()

    # Rule: If user asks to place an order, instruct them to use the Checkout page
    place_order_patterns = [
        r"\bplace\s+(?:an?\s+)?order\b",
        r"\bbuy\s+now\b",
        r"\bcheckout\b",
        r"\bmake\s+(?:an?\s+)?order\b",
        r"\bcomplete\s+(?:my\s+)?purchase\b",
    ]
    for pattern in place_order_patterns:
        if re.search(pattern, q_lower):
            return {
                "answer": "I cannot place orders for you. Please proceed to the Checkout page to complete your order."
            }

    db = SessionLocal()
    try:
        orders = (
            db.query(Order)
            .filter(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .all()
        )
    finally:
        db.close()

    if not orders:
        return {"answer": "You have not placed any orders yet."}

    order_summaries = []
    for o in orders:
        items_str = ", ".join(f"{it.product_name} (Qty: {it.quantity})" for it in o.items)
        date_str = o.created_at.strftime("%Y-%m-%d")
        order_summaries.append(
            f"Order ID: {o.id} | Date: {date_str} | Status: {o.status} | Total: ${o.total:.2f} | Items: [{items_str}]"
        )
    history_text = "\n".join(order_summaries)

    system_prompt = (
        "You are the Order specialist for SimpleShop.\n"
        "Here is the customer's REAL order history:\n"
        f"{history_text}\n\n"
        "Strict rules:\n"
        "1. Answer the customer's question about their orders and status using ONLY the history above.\n"
        "2. If the user asks about an order number not in their history, reply with: 'Order not found in your account.'\n"
        "3. If the user asks to place an order or buy items, say: 'I cannot place orders for you. Please proceed to the Checkout page to complete your order.'\n"
        "4. Never invent orders, statuses, dates, or prices.\n"
        "5. Keep the response polite and concise."
    )

    try:
        llm = get_llm()
        response = llm.invoke([
            ("system", system_prompt),
            ("human", question),
        ])
        answer = response.content.strip()
    except Exception:
        # Fallback safe summary
        answer = "Here are your orders:\n" + "\n".join(order_summaries)

    return {"answer": answer}
