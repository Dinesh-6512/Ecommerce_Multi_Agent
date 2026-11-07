from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Order, OrderItem, Cart, CartItem, Product, User
from backend.schemas import OrderCreate, OrderResponse
from backend.auth import get_current_user

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not (
        order_data.full_name.strip()
        and order_data.phone.strip()
        and order_data.address.strip()
        and order_data.city.strip()
        and order_data.postal_code.strip()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All delivery details are required",
        )

    user_cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not user_cart:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty",
        )

    cart_items = db.query(CartItem).filter(CartItem.cart_id == user_cart.id).all()
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty",
        )

    # Check stock for all items before making any modifications
    for item in cart_items:
        if not item.product or item.product.stock < item.quantity:
            product_name = item.product.name if item.product else "Item"
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product_name}",
            )

    try:
        total_price = sum(
            round(item.quantity * item.product.price, 2) for item in cart_items
        )

        order = Order(
            user_id=current_user.id,
            full_name=order_data.full_name.strip(),
            phone=order_data.phone.strip(),
            address=order_data.address.strip(),
            city=order_data.city.strip(),
            postal_code=order_data.postal_code.strip(),
            total=round(total_price, 2),
            status="placed",
        )
        db.add(order)
        db.flush()

        for item in cart_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product.id,
                product_name=item.product.name,
                price=item.product.price,
                quantity=item.quantity,
            )
            db.add(order_item)
            item.product.stock -= item.quantity

        db.query(CartItem).filter(CartItem.cart_id == user_cart.id).delete()
        db.commit()
        db.refresh(order)
        return order
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to place order",
        )


@router.get("", response_model=list[OrderResponse])
def get_user_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return orders

