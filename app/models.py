# I imported the column types needed for my requirements table.
from sqlalchemy import Integer, String, Text

# I imported the tools needed to define database columns.
from sqlalchemy.orm import Mapped, mapped_column

# I imported Base so SQLAlchemy recognizes this as a database table.
from app.database import Base


# I defined the database structure for every requirement.
class Requirement(Base):
    # I named the SQLite table.
    __tablename__ = "requirements"

    # I stored the internal database ID.
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # I stored the engineering-facing ID, such as MIS-001.
    requirement_key: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    # I stored a short requirement title.
    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    # I stored the complete requirement statement.
    statement: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # I stored the requirement level.
    level: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    # I stored the responsible engineering team.
    owner: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    # I stored how the requirement will be verified.
    verification_method: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    # I stored the current verification progress.
    verification_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="Not Started",
    )

    # I stored why the requirement exists.
    rationale: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # I stored the upstream requirement this requirement flows down from.
    parent_requirement_key: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )