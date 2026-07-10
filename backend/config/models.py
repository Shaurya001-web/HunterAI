from __future__ import annotations
from sqlalchemy import String, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from config.database import Base
from typing import Optional

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True) # Maps to Supabase auth user ID
    username: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    urls: Mapped[dict] = mapped_column(JSON, default=dict) # E.g. {"linkedin": "", "github": "", "portfolio": ""}
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
