from fastapi import HTTPException, APIRouter, Depends
from pydantic import BaseModel, Field
from app.db.models import Category, engine
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from sqlalchemy import select

router = APIRouter(prefix="/categories", tags=["categories"])


# Pydantic схемы
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int

    class Config:
        orm_mode = True


# Асинхронный dependency
async def get_db():
    async with AsyncSession(engine) as session:
        yield session


# Эндпоинты
@router.post("/", response_model=CategoryResponse)
async def create_category(category: CategoryCreate, db: AsyncSession = Depends(get_db)):
    db_category = Category(**category.dict())
    db.add(db_category)
    try:
        await db.commit()
        await db.refresh(db_category)
        return db_category
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Category creation failed: {e}")


@router.get("/", response_model=List[CategoryResponse])
async def read_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category))
    categories = result.scalars().all()
    return categories


@router.get("/{category_id}", response_model=CategoryResponse)
async def read_category(category_id: int, db: AsyncSession = Depends(get_db)):
    category = await db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(category_id: int, category: CategoryCreate, db: AsyncSession = Depends(get_db)):
    db_category = await db.get(Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    for key, value in category.dict(exclude_unset=True).items():
        setattr(db_category, key, value)
    try:
        await db.commit()
        await db.refresh(db_category)
        return db_category
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Category update failed: {e}")


@router.delete("/{category_id}", response_model=CategoryResponse)
async def delete_category(category_id: int, db: AsyncSession = Depends(get_db)):
    db_category = await db.get(Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    await db.delete(db_category)
    await db.commit()
    return db_category
