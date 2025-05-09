from fastapi import HTTPException, APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from sqlalchemy.exc import IntegrityError

from app.db.models import Cart, User, Product
from app.db.database import get_db

router = APIRouter(tags=["carts"])


class CartBase(BaseModel):
    user_id: int


class CartCreate(CartBase):
    pass


class CartResponse(CartBase):
    id: int
    items: List[int] = Field(default_factory=list)

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "items": [1, 2, 3]
            }
        }


async def get_user_cart_or_404(user_id: int, db: AsyncSession):
    """Вспомогательная функция для получения корзины пользователя"""
    result = await db.execute(
        select(Cart)
        .where(Cart.user_id == user_id)
        .options(selectinload(Cart.items))  # Загрузка связанных товаров
    )
    cart = result.scalars().first()

    if not cart:
        raise HTTPException(
            status_code=404,
            detail=f"Cart for user {user_id} not found"
        )

    return cart


@router.post("/", response_model=CartResponse, status_code=201)
async def create_cart(cart_data: CartCreate, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, cart_data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_cart = await db.execute(
        select(Cart).where(Cart.user_id == cart_data.user_id))
    if existing_cart.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User already has a cart")

    new_cart = Cart(user_id=cart_data.user_id)
    db.add(new_cart)

    try:
        await db.flush()
        await db.commit()
        await db.refresh(new_cart)
        return {
            "id": new_cart.id,
            "user_id": new_cart.user_id,
            "items": []
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Cart creation failed: {str(e)}")


@router.get("/user/{user_id}", response_model=CartResponse)
async def read_user_cart(user_id: int, db: AsyncSession = Depends(get_db)):
    cart = await get_user_cart_or_404(user_id, db)
    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "items": [item.id for item in cart.items]
    }


@router.post("/user/{user_id}/items/{product_id}", response_model=CartResponse)
async def add_item_to_user_cart(
        user_id: int,
        product_id: int,
        db: AsyncSession = Depends(get_db)):
    cart = await get_user_cart_or_404(user_id, db)
    product = await db.get(Product, product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        if product not in cart.items:
            cart.items.append(product)
            await db.commit()
            await db.refresh(cart)

        return {
            "id": cart.id,
            "user_id": cart.user_id,
            "items": [item.id for item in cart.items]
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to add item to cart: {str(e)}")


@router.delete("/user/{user_id}/items/{product_id}", response_model=CartResponse)
async def remove_item_from_user_cart(
        user_id: int,
        product_id: int,
        db: AsyncSession = Depends(get_db)):
    cart = await get_user_cart_or_404(user_id, db)
    product = await db.get(Product, product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        cart.items.remove(product)
        await db.commit()
        await db.refresh(cart)
        return {
            "id": cart.id,
            "user_id": cart.user_id,
            "items": [item.id for item in cart.items]
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to remove item from cart: {str(e)}")
