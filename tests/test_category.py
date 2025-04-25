import pytest
from fastapi import status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from unittest.mock import AsyncMock, patch
from sqlalchemy.exc import IntegrityError
from app.api.v1.category import create_category
from app.api.v1.category import CategoryCreate
from app.db.models import Category


class TestCreateCategory:
    @pytest.mark.asyncio
    async def test_create_category_success(self):
        """Тест успешного создания категории"""
        mock_session = AsyncMock(spec=AsyncSession)
        mock_session.commit = AsyncMock()
        mock_session.refresh = AsyncMock()

        test_category = CategoryCreate(name="Valid Category")

        result = await create_category(
            category=test_category,
            db=mock_session
        )

        # Проверяем что категория была добавлена
        mock_session.add.assert_called_once()
        assert isinstance(mock_session.add.call_args[0][0], Category)

        # Проверяем что commit и refresh были вызваны
        mock_session.commit.assert_awaited_once()
        mock_session.refresh.assert_awaited_once()

        # Проверяем возвращаемый результат
        assert result.name == test_category.name

    @pytest.mark.asyncio
    async def test_create_category_db_error(self):
        """Тест ошибки при коммите в БД"""
        mock_session = AsyncMock(spec=AsyncSession)
        mock_session.commit.side_effect = Exception("DB connection failed")
        mock_session.rollback = AsyncMock()

        with pytest.raises(HTTPException) as exc_info:
            await create_category(
                category=CategoryCreate(name="Test Category"),
                db=mock_session
            )

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "DB connection failed" in exc_info.value.detail
        mock_session.rollback.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_create_category_duplicate(self):
        """Тест создания дубликата категории"""
        mock_session = AsyncMock(spec=AsyncSession)
        mock_session.commit.side_effect = IntegrityError(
            "duplicate key value violates unique constraint",
            None,
            "categories_name_key"
        )
        mock_session.rollback = AsyncMock()

        with pytest.raises(HTTPException) as exc_info:
            await create_category(
                category=CategoryCreate(name="Duplicate"),
                db=mock_session
            )

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "already exists" in exc_info.value.detail.lower()
        mock_session.rollback.assert_awaited_once()

    @pytest.mark.asyncio
    @pytest.mark.parametrize("name,expected_status", [
        ("A" * 100, status.HTTP_200_OK),  # Максимальная длина
        ("A", status.HTTP_422_UNPROCESSABLE_ENTITY),  # Слишком короткое
        ("", status.HTTP_422_UNPROCESSABLE_ENTITY),  # Пустое
        ("Valid Name", status.HTTP_200_OK),  # Валидное
        ("A" * 101, status.HTTP_422_UNPROCESSABLE_ENTITY),  # Слишком длинное
    ])
    async def test_create_category_validation(self, name, expected_status):
        """Тест валидации входных данных"""
        mock_session = AsyncMock(spec=AsyncSession)

        if expected_status == status.HTTP_200_OK:
            # Для успешных случаев
            mock_session.commit = AsyncMock()
            mock_session.refresh = AsyncMock()

            result = await create_category(
                category=CategoryCreate(name=name),
                db=mock_session
            )

            assert result.name == name
        else:
            # Для случаев с ошибкой валидации
            with pytest.raises(HTTPException) as exc_info:
                await create_category(
                    category=CategoryCreate(name=name),
                    db=mock_session
                )

            assert exc_info.value.status_code == expected_status

    @pytest.mark.asyncio
    async def test_create_category_refresh_error(self):
        """Тест ошибки при обновлении объекта"""
        mock_session = AsyncMock(spec=AsyncSession)
        mock_session.commit = AsyncMock()
        mock_session.refresh.side_effect = Exception("Refresh failed")

        with pytest.raises(HTTPException) as exc_info:
            await create_category(
                category=CategoryCreate(name="Test"),
                db=mock_session
            )

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "Refresh failed" in exc_info.value.detail
