from pydantic import BaseModel, field_validator
from typing import List


ALLOWED_EXPERIENCE_LEVELS = {"Beginner", "Intermediate", "Advanced"}


class ParticipantBase(BaseModel):
    name: str
    skills: List[str]
    experience: str
    interests: List[str]
    preferred_role: str

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Name is required and cannot be empty.")
        return v.strip()

    @field_validator("skills")
    @classmethod
    def skills_not_empty(cls, v: List[str]) -> List[str]:
        if not v or len(v) == 0:
            raise ValueError("At least one skill is required.")
        return v

    @field_validator("interests")
    @classmethod
    def interests_not_empty(cls, v: List[str]) -> List[str]:
        if not v or len(v) == 0:
            raise ValueError("At least one interest is required.")
        return v

    @field_validator("experience")
    @classmethod
    def experience_allowed(cls, v: str) -> str:
        if v not in ALLOWED_EXPERIENCE_LEVELS:
            raise ValueError(
                f"Experience must be one of: {', '.join(sorted(ALLOWED_EXPERIENCE_LEVELS))}"
            )
        return v

    @field_validator("preferred_role")
    @classmethod
    def preferred_role_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Preferred role is required.")
        return v.strip()


class ParticipantCreate(ParticipantBase):
    """Used for POST /participants request body. No id — the DB assigns it."""
    pass


class ParticipantResponse(ParticipantBase):
    """Used for API responses — includes the DB-generated id."""
    id: int

    model_config = {"from_attributes": True}


class ParticipantWithId(ParticipantBase):
    """
    Used only for POST /generate-teams, where the caller (frontend or a client
    passing existing DB records) supplies participants that already have an id.
    Kept separate from ParticipantCreate/ParticipantResponse on purpose.
    """
    id: int


class GenerateTeamsRequest(BaseModel):
    team_size: int
    participants: List[ParticipantWithId]

    @field_validator("team_size")
    @classmethod
    def team_size_min(cls, v: int) -> int:
        if v < 2:
            raise ValueError("Team size must be at least 2.")
        return v


class TeamsResponse(BaseModel):
    teams: list