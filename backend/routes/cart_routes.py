from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Cart, CartItem, Product, User
from backend.schemas import CartItemAdd, CartResponse, CartItemResponse
from backend.auth import get_current_user

router = APIRouter(prefix="/api/cart", tags=["cart"])


@router.post("")
def add_to_cart(
    item_data: CartItemAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if item_data.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than zero",
        )

    product = db.query(Product).filter(Product.id == item_data.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    user_cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not user_cart:
        user_cart = Cart(user_id=current_user.id)
        db.add(user_cart)
        db.commit()
        db.refresh(user_cart)

    existing_item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == user_cart.id, CartItem.product_id == product.id)
        .first()
    )

    current_qty = existing_item.quantity if existing_item else 0
    new_total_qty = current_qty + item_data.quantity

    if new_total_qty > product.stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity exceeds available stock",
        )

    if existing_item:
        existing_item.quantity = new_total_qty
    else:
        new_item = CartItem(
            cart_id=user_cart.id,
            product_id=product.id,
            quantity=item_data.quantity,
        )
        db.add(new_item)

    db.commit()
    return {"detail": "Item added to cart"}


@router.get("", response_model=CartResponse)
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not user_cart:
        return {"items": [], "total": 0.0}

    cart_items = db.query(CartItem).filter(CartItem.cart_id == user_cart.id).all()

    items = []
    total = 0.0
    for ci in cart_items:
        subtotal = round(ci.quantity * ci.product.price, 2)
        total += subtotal
        items.append(
            CartItemResponse(
                id=ci.id,
                product_id=ci.product.id,
                product_name=ci.product.name,
                price=ci.product.price,
                quantity=ci.quantity,
                subtotal=subtotal,
            )
        )

    return CartResponse(items=items, total=round(total, 2))

