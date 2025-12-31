"""Dummy migration

Revision ID: 6f3d01f67426
Revises: 567890abcdef
Create Date: 2023-11-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '6f3d01f67426'
down_revision = '567890abcdef'
branch_labels = None
depends_on = None

def upgrade() -> None:
    pass

def downgrade() -> None:
    pass
