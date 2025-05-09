"""fix_cart_id_column

Revision ID: 54c3dc9bf483
Revises: c5007b0f8aa9
Create Date: 2025-05-09 02:22:07.552243

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '54c3dc9bf483'
down_revision: Union[str, None] = 'c5007b0f8aa9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
