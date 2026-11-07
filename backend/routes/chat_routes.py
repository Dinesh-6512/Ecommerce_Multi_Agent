import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from backend.models import User
from backend.schemas import ChatRequest, ChatResponse
from backend.auth import get_current_user
from backend.ai_agent.orchestrator import run_orchestrator

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat_endpoint(
    chat_data: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    question = (chat_data.question or "").strip()
    if not question:
        return ChatResponse(answer="Please provide a question.")

    try:
        request_id = str(uuid.uuid4())
        role = "admin" if current_user.is_admin else "user"
        answer = run_orchestrator(
            user_id=current_user.id,
            role=role,
            request_id=request_id,
            question=question,
        )
        return ChatResponse(answer=answer)
    except Exception:
        return ChatResponse(
            answer="Sorry, something went wrong. Please try again later."
        )

