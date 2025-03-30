from fastapi import APIRouter
from app.api.v1 import product, category, users, review, carts, orders

router = APIRouter()
router.include_router(product.router)
router.include_router(category.router)
router.include_router(users.router)
router.include_router(review.router)
router.include_router(carts.router)
router.include_router(orders.router)
