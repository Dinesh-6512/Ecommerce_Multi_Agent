from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, Cart
from backend.schemas import UserRegister, UserLogin, TokenResponse
from backend.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api", tags=["auth"])


@router.post("/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        is_admin=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    user_cart = Cart(user_id=new_user.id)
    db.add(user_cart)
    db.commit()

    return {"detail": "User registered successfully"}


@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        data={"sub": user.email, "is_admin": user.is_admin, "user_id": user.id}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_admin": user.is_admin,
    }

