import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas

router = APIRouter()
logger = logging.getLogger("smart_team_builder")


@router.post("/participants", response_model=schemas.ParticipantResponse)
def create_participant(participant: schemas.ParticipantCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_participant(db, participant)
    except SQLAlchemyError:
        logger.exception("Database error while creating participant")
        raise HTTPException(status_code=500, detail="Database error occurred while saving participant.")


@router.get("/participants")
def list_participants(db: Session = Depends(get_db)):
    try:
        return {"participants": crud.get_participants(db)}
    except SQLAlchemyError:
        logger.exception("Database error while listing participants")
        raise HTTPException(status_code=500, detail="Database error occurred while fetching participants.")


@router.delete("/participants/{participant_id}")
def delete_participant(participant_id: int, db: Session = Depends(get_db)):
    try:
        deleted = crud.delete_participant(db, participant_id)
    except SQLAlchemyError:
        logger.exception("Database error while deleting participant")
        raise HTTPException(status_code=500, detail="Database error occurred while deleting participant.")

    if not deleted:
        raise HTTPException(status_code=404, detail="Participant not found.")
    return {"message": "Participant deleted successfully"}