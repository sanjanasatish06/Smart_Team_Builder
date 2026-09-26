from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    skills = Column(Text, nullable=False)        # stored as JSON string, e.g. '["Python", "React"]'
    experience = Column(String, nullable=False)  # "Beginner" | "Intermediate" | "Advanced"
    interests = Column(Text, nullable=False)      # stored as JSON string
    preferred_role = Column(String, nullable=False)