from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_admin: bool


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_admin: bool

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    price: float
    stock: int


class ProductResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    price: float
    stock: int

    class Config:
        from_attributes = True


class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    price: float
    quantity: int
    subtotal: float


class CartResponse(BaseModel):
    items: list[CartItemResponse]
    total: float


class OrderCreate(BaseModel):
    full_name: str
    phone: str
    address: str
    city: str
    postal_code: str


class OrderItemResponse(BaseModel):
    id: int
    product_id: int | None = None
    product_name: str
    price: float
    quantity: int

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    full_name: str
    phone: str
    address: str
    city: str
    postal_code: str
    total: float
    status: str
    created_at: datetime
    items: list[OrderItemResponse]

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str

