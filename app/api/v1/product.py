from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.db.models import Product
from app.db.database import get_db  # Предполагается, что вынесли get_db в database.py
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
        from_attributes = True  # Заменяем orm_mode для Pydantic v2
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Example Product",
                "category_id": 1,
                "price": 99.99,
                "description": "Example description"
            }
        }


@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать новый товар",
    response_description="Созданный товар"
)
async def create_product(
        product: ProductCreate,
        db: AsyncSession = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    """
    Создает новый товар в системе.

    - **name**: Название товара (обязательно)
    - **category_id**: ID категории (обязательно)
    - **price**: Цена товара (обязательно)
    - **description**: Описание товара (опционально)
    """
    db_product = Product(**product.model_dump())  # Используем model_dump() для Pydantic v2
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product


@router.get(
    "/",
    response_model=List[ProductResponse],
    summary="Получить список всех товаров",
    response_description="Список товаров"
)
async def read_products(
        db: AsyncSession = Depends(get_db),
        skip: int = 0,
        limit: int = 100
):
    """
    Получает список всех товаров с возможностью пагинации.

    - **skip**: Количество пропускаемых товаров
    - **limit**: Максимальное количество возвращаемых товаров
    """
    result = await db.execute(select(Product).offset(skip).limit(limit))
    products = result.scalars().all()
    return products
