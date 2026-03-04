from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, String, DateTime, Text, Integer
from datetime import datetime, timezone
import uuid
from app.core.config import settings


class Base(DeclarativeBase):
    pass


class Repurpose(Base):
    __tablename__ = "repurposes"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=True)           # extracted or user-provided
    source_text = Column(Text, nullable=True)       # original content (truncated)
    source_type = Column(String, default="text")    # text | url
    source_url = Column(String, nullable=True)
    twitter_thread = Column(Text, nullable=True)    # JSON string of tweets list
    linkedin_post = Column(Text, nullable=True)
    email_newsletter = Column(Text, nullable=True)
    tldr = Column(Text, nullable=True)
    word_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
