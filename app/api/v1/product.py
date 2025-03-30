from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.db.models import Product, engine
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from sqlalchemy import select


from app.api.v1.auth import get_current_user


router = APIRouter(prefix="/products", tags=["products"])


# Pydantic схемы
class ProductBase(BaseModel):
    name: str
    category_id: int
    price: float
    description: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int

    class Config:
        orm_mode = True


# Асинхронный dependency
async def get_db():
    async with AsyncSession(engine) as session:
        yield session


@router.post("/", response_model=ProductResponse)
async def create_product(product: ProductCreate, db: AsyncSession = Depends(get_db),
                         current_user: dict = Depends(get_current_user)):
    db_product = Product(**product.dict())
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product


# Эндпоинты
# @router.post("/", response_model=ProductResponse)
# async def create_product(product: ProductCreate, db: AsyncSession = Depends(get_db)):
#     db_product = Product(**product.dict())
#     db.add(db_product)
#     await db.commit()
#     await db.refresh(db_product)
#     return db_product


@router.get("/", response_model=List[ProductResponse])
async def read_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))
    products = result.scalars().all()
    return products
