import json
from sqlalchemy.orm import Session
from app import models, schemas


def _row_to_dict(participant: models.Participant) -> dict:
    """Convert a DB row (skills/interests stored as JSON strings) into a plain dict with real lists."""
    return {
        "id": participant.id,
        "name": participant.name,
        "skills": json.loads(participant.skills),
        "experience": participant.experience,
        "interests": json.loads(participant.interests),
        "preferred_role": participant.preferred_role,
    }


def create_participant(db: Session, participant: schemas.ParticipantCreate) -> dict:
    db_participant = models.Participant(
        name=participant.name,
        skills=json.dumps(participant.skills),
        experience=participant.experience,
        interests=json.dumps(participant.interests),
        preferred_role=participant.preferred_role,
    )
    db.add(db_participant)
    db.commit()
    db.refresh(db_participant)
    return _row_to_dict(db_participant)


def get_participants(db: Session) -> list[dict]:
    rows = db.query(models.Participant).all()
    return [_row_to_dict(r) for r in rows]


def get_participant(db: Session, participant_id: int) -> dict | None:
    row = db.query(models.Participant).filter(models.Participant.id == participant_id).first()
    if row is None:
        return None
    return _row_to_dict(row)


def delete_participant(db: Session, participant_id: int) -> bool:
    row = db.query(models.Participant).filter(models.Participant.id == participant_id).first()
    if row is None:
        return False
    db.delete(row)
    db.commit()
    return True