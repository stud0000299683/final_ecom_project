from fastapi import HTTPException, APIRouter, Depends
from pydantic import BaseModel
from app.db.models import Order, User, OrderDetail, Product, engine
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from sqlalchemy import select

router = APIRouter(prefix="/orders", tags=["orders"])


# Pydantic схемы
class OrderBase(BaseModel):
    user_id: int
    total: float


class OrderCreate(OrderBase):
    pass


class OrderResponse(OrderBase):
    id: int
    order_details: List[int] = []

    class Config:
        from_attributes = True


class OrderDetailBase(BaseModel):
    product_id: int
    quantity: int


class OrderDetailCreate(OrderDetailBase):
    pass


class OrderDetailResponse(OrderDetailBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True


async def get_db():
    async with AsyncSession(engine) as session:
        yield session


# Endpoints
@router.post("/", response_model=OrderResponse, status_code=201)
async def create_order(order: OrderCreate, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, order.user_id)
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    db_order = Order(**order.dict())
    db.add(db_order)

    try:
        await db.commit()
        await db.refresh(db_order)
        return db_order
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Order creation failed: {e}")


@router.get("/", response_model=List[OrderResponse])
async def read_orders(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order))
    orders = result.scalars().all()
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
async def read_order(order_id: int, db: AsyncSession = Depends(get_db)):
    order = await db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/{order_id}/details/", response_model=OrderDetailResponse, status_code=201)
async def create_order_detail(order_id: int, order_detail: OrderDetailCreate, db: AsyncSession = Depends(get_db)):
    order = await db.get(Order, order_id)
    product = await db.get(Product, order_detail.product_id)

    if not order:
        raise HTTPException(status_code=400, detail="Order not found")
    if not product:
        raise HTTPException(status_code=400, detail="Product not found")

    db_order_detail = OrderDetail(order_id=order_id, **order_detail.dict())
    db.add(db_order_detail)

    try:
        await db.commit()
        await db.refresh(db_order_detail)
        return db_order_detail
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Order detail creation failed: {e}")


@router.get("/{order_id}/details/", response_model=List[OrderDetailResponse])
async def read_order_details(order_id: int, db: AsyncSession = Depends(get_db)):
    statement = select(OrderDetail).where(OrderDetail.order_id == order_id)
    result = await db.execute(statement)
    order_details = result.scalars().all()
    return order_details


@router.get("/details/{order_detail_id}", response_model=OrderDetailResponse)
async def read_order_detail(order_detail_id: int, db: AsyncSession = Depends(get_db)):
    order_detail = await db.get(OrderDetail, order_detail_id)
    if order_detail is None:
        raise HTTPException(status_code=404, detail="Order detail not found")
    return order_detail
