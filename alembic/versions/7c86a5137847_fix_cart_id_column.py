"""fix_cart_id_column

Revision ID: 7c86a5137847
Revises: 54c3dc9bf483
Create Date: 2025-05-09 02:25:32.210438

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7c86a5137847'
down_revision: Union[str, None] = '54c3dc9bf483'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
