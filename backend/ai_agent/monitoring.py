import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

try:
    from langfuse import get_client, observe
except Exception:
    def observe(*args, **kwargs):
        def decorator(fn):
            return fn
        return decorator

    def get_client():
        return None


def check_langfuse_connection():
    public_key = os.getenv("LANGFUSE_PUBLIC_KEY")
    secret_key = os.getenv("LANGFUSE_SECRET_KEY")
    if not public_key or not secret_key:
        print("Langfuse connected: no - check the keys and LANGFUSE_HOST")
        return

    try:
        client = get_client()
        if client and client.auth_check():
            print("Langfuse connected: yes")
        else:
            print("Langfuse connected: no - check the keys and LANGFUSE_HOST")
    except Exception:
        print("Langfuse connected: no - check the keys and LANGFUSE_HOST")


def get_langchain_callback():
    try:
        from langfuse.langchain import CallbackHandler
        return CallbackHandler()
    except Exception:
        return None


def record_trace_metadata(user_id: int, role: str, request_id: str):
    try:
        client = get_client()
        if client:
            client.update_current_trace(
                user_id=str(user_id),
                metadata={"role": role, "request_id": request_id},
            )
    except Exception:
        pass


def record_trace_score(name: str, value: int):
    try:
        client = get_client()
        if client:
            client.score_current_trace(name=name, value=value)
    except Exception:
        pass


def flush_langfuse():
    try:
        client = get_client()
        if client:
            client.flush()
    except Exception:
        pass


def evaluate_answer_found(answer: str, selected_agent: str | None) -> int:
    if not answer or not answer.strip():
        return 0

    if selected_agent in ("unclear", "unrelated", "error", "invalid"):
        return 0

    no_data_phrases = [
        "sorry, i couldn't find",
        "couldn't find any products",
        "couldn't find that product",
        "your cart is currently empty",
        "you have not placed any orders yet",
        "order not found in your account",
        "could you please explain",
        "i can only help with questions",
        "i cannot place orders",
        "orders cannot be cancelled",
        "cannot add",
        "sorry, something went wrong",
        "assistant is currently unavailable",
        "please provide a question",
    ]

    ans_lower = answer.lower()
    for phrase in no_data_phrases:
        if phrase in ans_lower:
            return 0

    return 1

