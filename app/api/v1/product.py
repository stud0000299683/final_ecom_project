from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pathlib import Path
import os
import json
import uuid
from datetime import datetime

from app.db.models import Product
from app.db.database import get_db
from app.api.v1.auth import get_current_user

router = APIRouter(tags=["products"])  # Изменен префикс

# Настройки для загрузки изображений
PRODUCT_IMAGE_DIR = Path("static/images/products")
PRODUCT_IMAGE_DIR.mkdir(parents=True, exist_ok=True)


class ProductBase(BaseModel):
    name: str
    category_id: int
    price: float
    description: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int
    main_image: Optional[str] = None
    additional_images_urls: Optional[List[str]] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Example Product",
                "category_id": 1,
                "price": 99.99,
                "description": "Example description",
                "main_image": "/static/images/products/main_123.jpg",
                "additional_images_urls": [
                    "/static/images/products/additional_123_1.jpg",
                    "/static/images/products/additional_123_2.jpg"
                ]
            }
        }


def save_product_image(file: UploadFile, product_id: int, is_main: bool = False) -> str:
    """Сохраняет изображение товара и возвращает его URL"""
    ext = file.filename.split(".")[-1].lower()
    prefix = "main" if is_main else "additional"
    filename = f"{prefix}_{product_id}_{uuid.uuid4()}.{ext}"
    save_path = PRODUCT_IMAGE_DIR / filename

    with open(save_path, "wb") as buffer:
        buffer.write(file.file.read())

    return f"/static/images/products/{filename}"


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
        name: str = Form(...),
        category_id: int = Form(...),
        price: float = Form(...),
        description: Optional[str] = Form(None),
        main_image: Optional[UploadFile] = File(None),
        additional_images: Optional[List[UploadFile]] = File([]),
        db: AsyncSession = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    # Проверка авторизации
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    db_product = Product(
        name=name,
        category_id=category_id,
        price=price,
        description=description
    )

    try:
        db.add(db_product)
        await db.commit()
        await db.refresh(db_product)

        # Обработка изображений
        if main_image:
            db_product.main_image = save_product_image(main_image, db_product.id, True)

        if additional_images:
            additional_urls = [save_product_image(img, db_product.id) for img in additional_images]
            db_product.additional_images = json.dumps(additional_urls)

        await db.commit()
        await db.refresh(db_product)
        return db_product
    except Exception as e:
        # Откат изменений при ошибке
        await db.rollback()
        # Удаление уже сохраненных файлов
        if hasattr(db_product, 'main_image') and db_product.main_image:
            os.remove(PRODUCT_IMAGE_DIR / db_product.main_image.split("/")[-1])
        if hasattr(db_product, 'additional_images') and db_product.additional_images:
            for img_url in json.loads(db_product.additional_images):
                os.remove(PRODUCT_IMAGE_DIR / img_url.split("/")[-1])
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[ProductResponse])
async def read_products(
        db: AsyncSession = Depends(get_db),
        skip: int = 0,
        limit: int = 100,
        category_id: Optional[int] = Query(None)  # Явное указание Query параметра
):
    query = select(Product).offset(skip).limit(limit)
    if category_id is not None:  # Явная проверка на None
        query = query.where(Product.category_id == category_id)

    result = await db.execute(query)
    products = result.scalars().all()

    # Преобразование JSON строки в список
    for product in products:
        if product.additional_images:
            try:
                product.additional_images_urls = json.loads(product.additional_images)
            except json.JSONDecodeError:
                product.additional_images_urls = []

    return products


@router.post("/{product_id}/upload-image")
async def upload_product_image(
        product_id: int,
        is_main: bool = Form(False),
        image: UploadFile = File(...),
        db: AsyncSession = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    # Проверка авторизации
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        image_url = save_product_image(image, product_id, is_main)

        if is_main:
            # Удаление старого изображения
            if product.main_image:
                try:
                    os.remove(PRODUCT_IMAGE_DIR / product.main_image.split("/")[-1])
                except FileNotFoundError:
                    pass
            product.main_image = image_url
        else:
            # Добавление к дополнительным изображениям
            additional = json.loads(product.additional_images) if product.additional_images else []
            additional.append(image_url)
            product.additional_images = json.dumps(additional)

        await db.commit()
        await db.refresh(product)
        return {"message": "Image uploaded successfully", "image_url": image_url}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{product_id}", response_model=ProductResponse)
async def read_product(product_id: int, db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.additional_images:
        try:
            product.additional_images_urls = json.loads(product.additional_images)
        except json.JSONDecodeError:
            product.additional_images_urls = []
    return product
