from langgraph.graph import StateGraph, END
from backend.ai_agent.state import AgentState
from backend.ai_agent.llm import get_llm
from backend.ai_agent.product_search_agent import product_search_node
from backend.ai_agent.cart_agent import cart_node
from backend.ai_agent.order_agent import order_node
from backend.ai_agent.monitoring import (
    observe,
    get_langchain_callback,
    record_trace_metadata,
    record_trace_score,
    flush_langfuse,
    evaluate_answer_found,
)


@observe(name="orchestrator")
def orchestrator_node(state: AgentState) -> dict:
    question = state["question"]
    if not question or not question.strip():
        return {
            "selected_agent": "invalid",
            "answer": "Please provide a question.",
        }

    system_prompt = (
        "You are the Orchestrator for SimpleShop's customer AI assistant.\n"
        "Classify the customer's question into EXACTLY ONE category:\n\n"
        "- PRODUCT_SEARCH: Questions about products in the shop, product catalog, prices, descriptions, or stock.\n"
        "- CART: Questions about viewing the shopping cart, cart contents, total, or adding an item to the cart.\n"
        "- ORDER: Questions about previous orders, order history, order status, tracking, or placing an order.\n"
        "- UNCLEAR: Vague inputs or simple greetings that lack a clear request (e.g. 'hello', 'hi', 'help', 'what').\n"
        "- UNRELATED: Anything not related to this shop's products, cart, or orders (e.g. weather, politics, jokes).\n\n"
        "Respond with ONLY the single category name in capital letters."
    )

    try:
        llm = get_llm()
        response = llm.invoke([
            ("system", system_prompt),
            ("human", question),
        ])
        category = response.content.strip().upper()
    except Exception:
        return {
            "selected_agent": "error",
            "answer": "Sorry, the assistant is currently unavailable. Please try again later.",
        }

    if "UNCLEAR" in category:
        return {
            "selected_agent": "unclear",
            "answer": "Could you please explain or provide more details so I can help you?",
        }

    if "UNRELATED" in category:
        return {
            "selected_agent": "unrelated",
            "answer": "I can only help with questions about our shop's products, your cart, or your orders.",
        }

    if "CART" in category:
        return {"selected_agent": "cart"}

    if "ORDER" in category:
        return {"selected_agent": "order"}

    return {"selected_agent": "product_search"}


def route_decision(state: AgentState) -> str:
    agent = state.get("selected_agent")
    if agent == "product_search":
        return "product_search"
    elif agent == "cart":
        return "cart"
    elif agent == "order":
        return "order"
    return END


workflow = StateGraph(AgentState)
workflow.add_node("orchestrator", orchestrator_node)
workflow.add_node("product_search", product_search_node)
workflow.add_node("cart", cart_node)
workflow.add_node("order", order_node)

workflow.set_entry_point("orchestrator")
workflow.add_conditional_edges(
    "orchestrator",
    route_decision,
    {
        "product_search": "product_search",
        "cart": "cart",
        "order": "order",
        END: END,
    },
)
workflow.add_edge("product_search", END)
workflow.add_edge("cart", END)
workflow.add_edge("order", END)

agent_app = workflow.compile()


@observe(name="shop-assistant-agent")
def run_orchestrator(user_id: int, role: str, request_id: str, question: str) -> str:
    # Safely attach Langfuse trace metadata
    try:
        record_trace_metadata(user_id=user_id, role=role, request_id=request_id)
    except Exception:
        pass

    handler = None
    try:
        handler = get_langchain_callback()
    except Exception:
        pass

    initial_state: AgentState = {
        "user_id": user_id,
        "role": role,
        "request_id": request_id,
        "question": question,
    }

    config = {"callbacks": [handler]} if handler else {}

    try:
        result = agent_app.invoke(initial_state, config=config)
        answer = result.get("answer") or "Sorry, I could not process your request."
        selected = result.get("selected_agent")

        try:
            score = evaluate_answer_found(answer, selected)
            record_trace_score(name="answer_found", value=score)
        except Exception:
            pass

        return answer
    except Exception:
        return "Sorry, something went wrong. Please try again later."
    finally:
        try:
            flush_langfuse()
        except Exception:
            pass
