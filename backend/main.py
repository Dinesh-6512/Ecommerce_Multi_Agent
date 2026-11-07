import os
from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.database import engine, Base, get_db, SessionLocal
from backend.models import User, Product, Cart
from backend.auth import hash_password
from backend.routes.auth_routes import router as auth_router
from backend.routes.product_routes import router as product_router
from backend.routes.cart_routes import router as cart_router
from backend.routes.order_routes import router as order_router
from backend.routes.chat_routes import router as chat_router
from backend.ai_agent.monitoring import check_langfuse_connection

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Seed demo user
        demo_user = db.query(User).filter(User.email == "user@shop.com").first()
        if not demo_user:
            demo_user = User(
                name="Demo User",
                email="user@shop.com",
                hashed_password=hash_password("User@123"),
                is_admin=False,
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            db.add(Cart(user_id=demo_user.id))
            db.commit()

        # Seed demo admin
        demo_admin = db.query(User).filter(User.email == "admin@shop.com").first()
        if not demo_admin:
            demo_admin = User(
                name="Demo Admin",
                email="admin@shop.com",
                hashed_password=hash_password("Admin@123"),
                is_admin=True,
            )
            db.add(demo_admin)
            db.commit()
            db.refresh(demo_admin)
            db.add(Cart(user_id=demo_admin.id))
            db.commit()

        # Seed sample products if table is empty
        product_count = db.query(Product).count()
        if product_count == 0:
            sample_products = [
                Product(name="Classic White Sneakers", description="Comfortable everyday sneakers", price=79.99, stock=20),
                Product(name="Running Pro Shoes", description="Lightweight shoes for marathon running", price=120.00, stock=15),
                Product(name="High-Top Street Shoes", description="Stylish urban sneakers with ankle support", price=95.50, stock=10),
                Product(name="Slip-On Casual Shoes", description="Easy slip-on shoes for casual wear", price=49.99, stock=30),
            ]
            db.add_all(sample_products)
            db.commit()
    except Exception as e:
        print(f"Error seeding demo data: {e}")
    finally:
        db.close()

    check_langfuse_connection()

    yield


app = FastAPI(title="Ecommerce API", lifespan=lifespan)

cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(product_router)
app.include_router(cart_router)
app.include_router(order_router)
app.include_router(chat_router)


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "disconnected", "detail": str(e)}
