"""fix_cart_id_column

Revision ID: e7ef0a09231e
Revises: 9f754bb0b523
Create Date: 2025-05-09 02:37:28.856100

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e7ef0a09231e'
down_revision: Union[str, None] = '9f754bb0b523'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
