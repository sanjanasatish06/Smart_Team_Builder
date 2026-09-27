from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from datetime import datetime, timezone
from app.database import Base


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    skills = Column(Text, nullable=False)        # stored as JSON string, e.g. '["Python", "React"]'
    experience = Column(String, nullable=False)  # "Beginner" | "Intermediate" | "Advanced"
    interests = Column(Text, nullable=False)      # stored as JSON string
    preferred_role = Column(String, nullable=False)


class SavedTeam(Base):
    __tablename__ = "saved_teams"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(String, index=True, nullable=True)
    save_type = Column(String, default="formation", nullable=True)  # "individual" | "formation"
    team_name = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    score_breakdown = Column(Text, nullable=False)       # stored as JSON string
    reasons = Column(Text, nullable=False)               # stored as JSON string
    members = Column(Text, nullable=False)               # stored as JSON string of member dicts
    participant_ids = Column(Text, nullable=False)       # stored as JSON string, e.g. '[1, 2, 4]'
    project_name = Column(String, nullable=True)
    project_description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)