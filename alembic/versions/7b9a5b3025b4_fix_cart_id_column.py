"""fix_cart_id_column

Revision ID: 7b9a5b3025b4
Revises: 068f2b292640
Create Date: 2025-05-09 02:40:54.042211

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7b9a5b3025b4'
down_revision: Union[str, None] = '068f2b292640'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
