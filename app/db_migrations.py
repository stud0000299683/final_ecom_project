from alembic.config import Config
from alembic import command
from sqlalchemy.ext.asyncio import AsyncEngine
import asyncio
import logging

logger = logging.getLogger(__name__)


async def run_async_migrations(engine: AsyncEngine):
    try:
        logger.info("Starting database migrations...")

        alembic_cfg = Config()
        alembic_cfg.set_main_option("script_location", "alembic")
        alembic_cfg.set_main_option("sqlalchemy.url", str(engine.url))

        async with engine.begin() as conn:
            await conn.run_sync(
                lambda sync_conn: command.upgrade(alembic_cfg, "head")
            )

        logger.info("Database migrations completed successfully")
        return True
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}", exc_info=True)
        raise


def run_migrations(engine: AsyncEngine):
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        return loop.run_until_complete(run_async_migrations(engine))
    finally:
        loop.close()
