"""fix_cart_id_column

Revision ID: 068f2b292640
Revises: e7ef0a09231e
Create Date: 2025-05-09 02:37:48.246571

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '068f2b292640'
down_revision: Union[str, None] = 'e7ef0a09231e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
