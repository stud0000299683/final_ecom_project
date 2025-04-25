import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import router  # Импортируем роутер

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

# Подключите роутеры с тегами
app.include_router(router, prefix="/api/v1")

# Настройка CORS ()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
async def root():
    return {"message": "E-commerce API is running"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
