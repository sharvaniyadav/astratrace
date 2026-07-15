# I imported the tools needed to connect to the database.
from sqlalchemy import create_engine

# I imported the tools needed to create sessions and database models.
from sqlalchemy.orm import declarative_base, sessionmaker


# I stored the location of my SQLite database.
DATABASE_URL = "sqlite:///./astratrace.db"


# I created the connection between my backend and SQLite.
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)


# I created a factory for opening database sessions.
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# I created the parent class for all database tables.
Base = declarative_base()


# I opened a database session for each request and closed it afterward.
def get_database():
    database = SessionLocal()

    try:
        yield database
    finally:
        database.close()