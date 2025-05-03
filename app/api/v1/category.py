from fastapi import HTTPException, APIRouter, Depends, UploadFile, File, Form
from pydantic import BaseModel, Field
from app.db.models import Category, engine
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from sqlalchemy import select
import json
from pathlib import Path
import os
from datetime import datetime
import uuid

router = APIRouter(tags=["categories"])

# Настройки для загрузки изображений
IMAGE_DIR = Path("static/images/categories")
IMAGE_DIR.mkdir(parents=True, exist_ok=True)


# Pydantic схемы
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    image: Optional[str] = None
    thumbnail: Optional[str] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None

    class Config:
        from_attributes = True


# Асинхронный dependency
async def get_db():
    async with AsyncSession(engine) as session:
        yield session


def save_uploaded_file(file: UploadFile, subdir: str = "") -> str:
    """Сохраняет загруженный файл и возвращает его URL"""
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    save_path = IMAGE_DIR / subdir / filename if subdir else IMAGE_DIR / filename

    with open(save_path, "wb") as buffer:
        buffer.write(file.file.read())

    return f"/static/images/categories/{subdir}/{filename}" if subdir else f"/static/images/categories/{filename}"


@router.post("/", response_model=CategoryResponse)
async def create_category(
        name: str = Form(...),
        image: Optional[UploadFile] = File(None),
        thumbnail: Optional[UploadFile] = File(None),
        db: AsyncSession = Depends(get_db)
):
    image_url = save_uploaded_file(image) if image else None
    thumbnail_url = save_uploaded_file(thumbnail, "thumbnails") if thumbnail else None

    db_category = Category(
        name=name,
        image_url=image_url,
        thumbnail_url=thumbnail_url
    )

    db.add(db_category)
    try:
        await db.commit()
        await db.refresh(db_category)
        return db_category
    except Exception as e:
        # Удаляем сохраненные файлы в случае ошибки
        if image_url:
            os.remove(IMAGE_DIR / image_url.split("/")[-1])
        if thumbnail_url:
            os.remove(IMAGE_DIR / "thumbnails" / thumbnail_url.split("/")[-1])
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
async def update_category(
        category_id: int,
        name: Optional[str] = Form(None),
        image: Optional[UploadFile] = File(None),
        thumbnail: Optional[UploadFile] = File(None),
        db: AsyncSession = Depends(get_db)
):
    db_category = await db.get(Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    old_image = db_category.image_url
    old_thumbnail = db_category.thumbnail_url

    if name:
        db_category.name = name

    if image:
        db_category.image_url = save_uploaded_file(image)

    if thumbnail:
        db_category.thumbnail_url = save_uploaded_file(thumbnail, "thumbnails")

    try:
        await db.commit()
        await db.refresh(db_category)

        # Удаляем старые файлы после успешного обновления
        if image and old_image:
            os.remove(IMAGE_DIR / old_image.split("/")[-1])
        if thumbnail and old_thumbnail:
            os.remove(IMAGE_DIR / "thumbnails" / old_thumbnail.split("/")[-1])

        return db_category
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Category update failed: {e}")


@router.delete("/{category_id}", response_model=CategoryResponse)
async def delete_category(category_id: int, db: AsyncSession = Depends(get_db)):
    db_category = await db.get(Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Удаляем связанные файлы
    if db_category.image_url:
        os.remove(IMAGE_DIR / db_category.image_url.split("/")[-1])
    if db_category.thumbnail_url:
        os.remove(IMAGE_DIR / "thumbnails" / db_category.thumbnail_url.split("/")[-1])

    await db.delete(db_category)
    await db.commit()
    return db_category
