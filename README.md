# E-Com Project

Проект интернет-магазина с использованием:
- **Backend**: FastAPI (Python)
- **Frontend**: React
- **Mobile**: Ionic
- **База данных**: PostgreSQL

## Установка

1. Склонируйте репозиторий:
   ```bash
   git clone https://github.com/stud0000299683/final_ecom_project.git
   cd final_ecom_project
   
2. Запуск проекта в Docker
Все сервисы запускаются одной командой:

   ```bash
   docker-compose up --build
      
Или в фоновом режиме:

   ```bash
   docker-compose up -d --build
   ```   

3. Доступ к сервисам
После запуска будут доступны:

- Backend API: http://localhost:8000
- Frontend (React): http://localhost:3000
- Mobile (Ionic): http://localhost:8100

- Админка PostgreSQL:
- Хост: localhost:5432
- Логин/пароль: postgres/postgres
- База данных: postgres

4. Остановка проекта
   ```bash
   docker-compose down
