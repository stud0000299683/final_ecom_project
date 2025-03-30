import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker, declarative_base
from contextlib import asynccontextmanager, contextmanager
import logging

# Настройка логгера
logger = logging.getLogger(__name__)

# Базовый класс для моделей (если еще не определен)
Base = declarative_base()

# Настройка подключения
PG_URL = 'postgresql+asyncpg://postgres:postgre@localhost:5433/postgres'

class Database:
    def __init__(self):
        self.engine = create_async_engine(
            PG_URL,
            echo=True,
            pool_size=10,
            max_overflow=20,
            pool_timeout=30,
            pool_recycle=3600
        )
        self.async_session_maker = async_sessionmaker(
            bind=self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False
        )
        self.sync_session_maker = sessionmaker(
            bind=self.engine.sync_engine,
            autocommit=False,
            autoflush=False
        )

    async def init_models(self):
        """Создание таблиц (только для разработки)"""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized")

    @asynccontextmanager
    async def async_session(self):
        """Асинхронный контекст для сессий"""
        session = self.async_session_maker()
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

    @contextmanager
    def sync_session(self):
        """Синхронный контекст для сессий"""
        session = self.sync_session_maker()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()


db = Database()

# FastAPI зависимости (для удобства)
get_async_db = db.async_session
get_sync_db = db.sync_session

async_engine = create_async_engine(
    PG_URL,
    echo=True,
    pool_size=10,
    max_overflow=20
)
