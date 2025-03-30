from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.db.database import async_engine
from app.db_migrations import run_migrations
import uvicorn

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # Применяем миграции при старте
#     run_migrations(async_engine)
#     yield

# app = FastAPI(lifespan=lifespan)
app = FastAPI()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)