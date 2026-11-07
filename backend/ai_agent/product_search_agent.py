from backend.database import SessionLocal
from backend.models import Product
from backend.ai_agent.llm import get_llm
from backend.ai_agent.state import AgentState
from backend.ai_agent.monitoring import observe


@observe(name="product-search-agent")
def product_search_node(state: AgentState) -> dict:
    question = state["question"]

    db = SessionLocal()
    try:
        products = db.query(Product).order_by(Product.id.asc()).all()
    finally:
        db.close()

    if not products:
        return {"answer": "Sorry, I couldn't find any products in our shop."}

    catalog_lines = [
        f"ID: {p.id} | Name: {p.name} | Price: ${p.price:.2f} | Stock: {p.stock} | Description: {p.description or 'No description'}"
        for p in products
    ]
    catalog_text = "\n".join(catalog_lines)

    system_prompt = (
        "You are the Product Search specialist for SimpleShop.\n"
        "Here is the REAL and ONLY product catalog from our database:\n"
        f"{catalog_text}\n\n"
        "Strict rules:\n"
        "1. Answer the customer's question using ONLY the provided catalog data.\n"
        "2. If no products match what the customer asks for, respond with: "
        "'Sorry, I couldn't find any products matching that in our shop.'\n"
        "3. Answer price, stock, and product details accurately according to the catalog.\n"
        "4. Never invent products, prices, or stock numbers.\n"
        "5. Keep the response friendly, helpful, and concise."
    )

    try:
        llm = get_llm()
        response = llm.invoke([
            ("system", system_prompt),
            ("human", question),
        ])
        answer = response.content.strip()
    except Exception:
        answer = "Sorry, the assistant is currently unavailable. Please try again later."

    return {"answer": answer}
