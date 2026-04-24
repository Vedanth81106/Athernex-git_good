from sqlalchemy import Column, Integer, Float, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, UTC
from database import Base

class Job(Base):
    __tablename__ = "jobs"

    job_id = Column(Integer, primary_key=True, index = True)
    script = Column(String, nullable = False)
    target_url = Column(String, nullable = False)
    status = Column(String, default="queued")
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    # selectors = relationship("Selector", back_populates="job")
    # logs = relationship("HealLog", back_populates="job")

class Selectors(Base):
    __tablename__ = "selectors"

    selector_id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.job_id", ondelete="CASCADE"), nullable=False)
    intent = Column(String, index=True) #index=True here because intent is constantly being fetched by middleware
    selector = Column(String, nullable=False)
    last_success_dom = Column(JSON, nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC))

class HealLogs(Base):
    __tablename__ = "heal_logs"

    heal_id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.job_id", ondelete="CASCADE"), nullable=False)
    intent = Column(String)
    old_selector = Column(String)
    new_selector = Column(String)
    current_dom = Column(JSON)
    confidence = Column(Float)
    healed_by = Column(String)
    healed_at = Column(DateTime, default=lambda: datetime.now(UTC))