from fastapi import HTTPException, APIRouter, Depends
from pydantic import BaseModel, Field
from app.db.models import Review, User, Product, engine
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from sqlalchemy import select

router = APIRouter(prefix="/reviews", tags=["reviews"])


# Pydantic схемы
class ReviewBase(BaseModel):
    text: str = Field(..., min_length=10, max_length=500)
    rating: int = Field(..., ge=1, le=5)
    product_id: int
    user_id: int


class ReviewCreate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    id: int

    class Config:
        orm_mode = True


async def get_db():
    async with AsyncSession(engine) as session:
        yield session


# Эндпоинты
@router.post("/", response_model=ReviewResponse, status_code=201)
async def create_review(review: ReviewCreate, db: AsyncSession = Depends(get_db)):
    # Проверяем, существует ли пользователь и продукт
    user = await db.get(User, review.user_id)
    product = await db.get(Product, review.product_id)
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    if not product:
        raise HTTPException(status_code=400, detail="Product not found")

    db_review = Review(**review.dict())
    db.add(db_review)
    try:
        await db.commit()
        await db.refresh(db_review)
        return db_review
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Review creation failed: {e}")


@router.get("/", response_model=List[ReviewResponse])
async def read_reviews(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review))
    reviews = result.scalars().all()
    return reviews


@router.get("/{review_id}", response_model=ReviewResponse)
async def read_review(review_id: int, db: AsyncSession = Depends(get_db)):
    review = await db.get(Review, review_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    return review


@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(review_id: int, review: ReviewBase, db: AsyncSession = Depends(get_db)):
    db_review = await db.get(Review, review_id)
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    # Проверяем, существует ли пользователь и продукт
    user = await db.get(User, review.user_id)
    product = await db.get(Product, review.product_id)
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    if not product:
        raise HTTPException(status_code=400, detail="Product not found")

    for key, value in review.dict(exclude_unset=True).items():
        setattr(db_review, key, value)
    try:
        await db.commit()
        await db.refresh(db_review)
        return db_review
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Review update failed: {e}")


@router.delete("/{review_id}", response_model=ReviewResponse)
async def delete_review(review_id: int, db: AsyncSession = Depends(get_db)):
    db_review = await db.get(Review, review_id)
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    await db.delete(db_review)
    await db.commit()
    return db_review
