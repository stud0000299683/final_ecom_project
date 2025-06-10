import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import router  # Импортируем роутер
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(
    title="E-commerce API",
    description="API для интернет-магазина",
    version="1.0.0",
    openapi_tags=[{
        "name": "products",
        "description": "Операции с товарами"
    }, {
        "name": "users",
        "description": "Управление пользователями"
    }]
)


app.include_router(router, prefix="/api/v1")
# Получаем абсолютный путь к папке static
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "app", "static")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


# Настройка CORS ()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://localhost:8100"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
async def root():
    return {"message": "E-commerce API is running"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
