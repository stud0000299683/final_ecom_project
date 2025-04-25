from fastapi import APIRouter
from app.api.v1 import product, category, users, review, carts, orders

router = APIRouter()

# Явно указываем префиксы и теги для каждого роутера
router.include_router(product.router, prefix="/products", tags=["products"])
router.include_router(category.router, prefix="/categories", tags=["categories"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(review.router, prefix="/reviews", tags=["reviews"])
router.include_router(carts.router, prefix="/carts", tags=["carts"])
router.include_router(orders.router, prefix="/orders", tags=["orders"])
