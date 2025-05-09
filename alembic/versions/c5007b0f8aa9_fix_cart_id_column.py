"""fix_cart_id_column

Revision ID: c5007b0f8aa9
Revises: b60693dbee26
Create Date: 2025-05-09 02:18:28.117517

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c5007b0f8aa9'
down_revision: Union[str, None] = 'b60693dbee26'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
