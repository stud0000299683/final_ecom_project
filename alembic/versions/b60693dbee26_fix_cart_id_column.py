"""fix_cart_id_column

Revision ID: b60693dbee26
Revises: b0fd89916e03
Create Date: 2025-05-09 02:09:26.487489

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b60693dbee26'
down_revision: Union[str, None] = 'b0fd89916e03'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
