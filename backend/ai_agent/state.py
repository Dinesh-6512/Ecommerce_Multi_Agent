from typing import TypedDict, Optional


class AgentState(TypedDict, total=False):
    user_id: int
    role: str
    request_id: str
    question: str
    selected_agent: Optional[str]
    answer: Optional[str]

