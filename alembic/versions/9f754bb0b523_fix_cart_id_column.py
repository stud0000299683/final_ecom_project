"""fix_cart_id_column

Revision ID: 9f754bb0b523
Revises: 7c86a5137847
Create Date: 2025-05-09 02:26:43.593191

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9f754bb0b523'
down_revision: Union[str, None] = '7c86a5137847'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
