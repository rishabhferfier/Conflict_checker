# SQLAlchemy engine creator
from sqlalchemy import create_engine

# Session maker
from sqlalchemy.orm import sessionmaker

# Base class for ORM models
from sqlalchemy.orm import declarative_base

# Load .env variables
from dotenv import load_dotenv

import os

# Load environment variables
load_dotenv()

# Read DB URL from .env
DATABASE_URL = os.getenv("DATABASE_URL")

# Create PostgreSQL engine
engine = create_engine(DATABASE_URL)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base model class
Base = declarative_base()