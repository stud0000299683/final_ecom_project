import asyncio
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Float, Table, Text
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy import Identity

Base = declarative_base(cls=AsyncAttrs)
PG_URL = 'postgresql+asyncpg://postgres:postgre@localhost:5433/postgres'
engine = create_async_engine(PG_URL, echo=True)


async def create_db():
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)


# Пользователи
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, Identity(), primary_key=True)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    reviews = relationship("Review", back_populates="user")
    carts = relationship("Cart", back_populates="user")
    orders = relationship("Order", back_populates="user")


# Категории
class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, Identity(), primary_key=True)
    name = Column(String(100), unique=True, index=True)
    image_url = Column(String(255), nullable=True)  # URL изображения категории
    thumbnail_url = Column(String(255), nullable=True)  # URL миниатюры
    products = relationship("Product", back_populates="category")


# Товары
class Product(Base):
    __tablename__ = 'products'
    id = Column(Integer, Identity(), primary_key=True)
    name = Column(String(255), index=True)
    category_id = Column(Integer, ForeignKey('categories.id'))
    price = Column(Float)
    rating = Column(Float, default=0.0)
    description = Column(String, nullable=True)
    main_image = Column(String(255), nullable=True)  # Основное изображение товара
    additional_images = Column(Text, nullable=True)  # JSON массив дополнительных изображений
    category = relationship("Category", back_populates="products")
    reviews = relationship("Review", back_populates="product")


# Отзывы
class Review(Base):
    __tablename__ = 'reviews'
    id = Column(Integer, Identity(), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    product_id = Column(Integer, ForeignKey('products.id'))
    text = Column(String(500))
    rating = Column(Integer)
    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")


# Корзина
cart_items = Table(
    'cart_items',
    Base.metadata,
    Column('cart_id', Integer, ForeignKey('carts.id')),
    Column('product_id', Integer, ForeignKey('products.id'))
)


class Cart(Base):
    __tablename__ = 'carts'
    id = Column(Integer, Identity(), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    items = relationship("Product", secondary=cart_items)
    user = relationship("User", back_populates="carts")


# Заказы
class Order(Base):
    __tablename__ = 'orders'
    id = Column(Integer, Identity(), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    total = Column(Float)
    user = relationship("User", back_populates="orders")
    details = relationship("OrderDetail", back_populates="order")


# Детализация заказов
class OrderDetail(Base):
    __tablename__ = 'orderdetails'
    id = Column(Integer, Identity(), primary_key=True)
    order_id = Column(Integer, ForeignKey('orders.id'))
    product_id = Column(Integer, ForeignKey('products.id'))
    quantity = Column(Integer, default=1)
    order = relationship("Order", back_populates="details")
    product = relationship("Product")


if __name__ == "__main__":
    asyncio.run(create_db())
