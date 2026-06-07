from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # Matches Supabase auth user ID
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    skills = Column(JSON, default=list)
    education = Column(JSON, default=list)
    experience = Column(JSON, default=list)
    projects = Column(JSON, default=list)

    user = relationship("User", back_populates="profile")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    skills = Column(JSON, default=list)
    location = Column(String, nullable=True)
    stipend = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    url = Column(String, nullable=True)
    source = Column(String, nullable=True)

    matches = relationship("Match", back_populates="job", cascade="all, delete-orphan")

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)

    user = relationship("User", back_populates="matches")
    job = relationship("Job", back_populates="matches")
