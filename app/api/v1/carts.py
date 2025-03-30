from fastapi import HTTPException, APIRouter, Depends
from pydantic import BaseModel
from app.db.models import Cart, User, Product, engine
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import selectinload

router = APIRouter(prefix="/carts", tags=["carts"])


# Pydantic схемы
class CartBase(BaseModel):
    user_id: int


class CartCreate(CartBase):
    pass


class CartResponse(CartBase):
    id: int
    items: List[int] = []

    class Config:
        orm_mode = True


async def get_db():
    async with AsyncSession(engine) as session:
        yield session


# Эндпоинты
@router.post("/", response_model=CartResponse, status_code=201)
async def create_cart(cart: CartCreate, db: AsyncSession = Depends(get_db)):
    # Проверяем, существует ли пользователь
    user = await db.get(User, cart.user_id)
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    db_cart = Cart(**cart.dict())
    db.add(db_cart)
    try:
        await db.commit()
        await db.refresh(db_cart)
        return db_cart
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Cart creation failed: {e}")


@router.get("/{cart_id}", response_model=CartResponse)
async def read_cart(cart_id: int, db: AsyncSession = Depends(get_db)):
    statement = select(Cart).where(Cart.id == cart_id).options(selectinload(Cart.items))
    result = await db.execute(statement)
    cart = result.scalars().first()

    if cart is None:
        raise HTTPException(status_code=404, detail="Cart not found")

    cart.items = [product.id for product in cart.items]
    return cart


@router.post("/{cart_id}/items/{product_id}", response_model=CartResponse)
async def add_item_to_cart(cart_id: int, product_id: int, db: AsyncSession = Depends(get_db)):
    cart = await db.get(Cart, cart_id)
    product = await db.get(Product, product_id)

    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    cart.items.append(product)

    try:
        await db.commit()
        await db.refresh(cart)
        return cart
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to add item to cart: {e}")


@router.delete("/{cart_id}/items/{product_id}", response_model=CartResponse)
async def remove_item_from_cart(cart_id: int, product_id: int, db: AsyncSession = Depends(get_db)):
    cart = await db.get(Cart, cart_id)
    product = await db.get(Product, product_id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    cart.items.remove(product)
    try:
        await db.commit()
        await db.refresh(cart)
        return cart
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to remove item from cart: {e}")
