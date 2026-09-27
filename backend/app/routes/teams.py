import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas
from app.services.team_builder import generate_teams

router = APIRouter()
logger = logging.getLogger("smart_team_builder")


@router.post("/generate-teams")
def generate_teams_endpoint(request: schemas.GenerateTeamsRequest):
    participants = [p.model_dump() for p in request.participants]

    if len(participants) == 0:
        raise HTTPException(status_code=400, detail="Participant list cannot be empty.")

    if request.team_size > len(participants):
        raise HTTPException(
            status_code=400,
            detail="Team size cannot exceed number of participants."
        )

    try:
        result = generate_teams(participants, request.team_size)
        if request.project_requirements:
            result["project_requirements"] = request.project_requirements.model_dump()
    except Exception:
        logger.exception("Matching engine raised an exception during generate_teams()")
        raise HTTPException(status_code=500, detail="Matching engine failed to generate teams.")

    return result


@router.post("/saved-teams", response_model=schemas.SavedTeamsListResponse)
def save_teams_endpoint(request: schemas.SaveTeamsRequest, db: Session = Depends(get_db)):
    try:
        saved = crud.save_teams(db, request)
        categorized = crud.get_categorized_saved_teams(db)
        return {
            "teams": saved,
            "individual_teams": categorized["individual_teams"],
            "formations": categorized["formations"],
            "total": len(saved),
            "message": f"Successfully saved {len(saved)} team(s).",
        }
    except SQLAlchemyError:
        logger.exception("Database error while saving teams")
        raise HTTPException(status_code=500, detail="Database error occurred while saving teams.")
    except Exception:
        logger.exception("Unexpected error while saving teams")
        raise HTTPException(status_code=500, detail="Failed to save teams.")


@router.get("/saved-teams", response_model=schemas.SavedTeamsListResponse)
def list_saved_teams_endpoint(
    group_id: Optional[str] = None,
    save_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    try:
        if group_id or save_type:
            teams = crud.get_saved_teams(db, group_id=group_id, save_type=save_type)
            return {
                "teams": teams,
                "total": len(teams),
            }
        categorized = crud.get_categorized_saved_teams(db)
        return categorized
    except SQLAlchemyError:
        logger.exception("Database error while fetching saved teams")
        raise HTTPException(status_code=500, detail="Database error occurred while fetching saved teams.")


@router.get("/saved-teams/{team_id}", response_model=schemas.SavedTeamResponse)
def get_saved_team_endpoint(team_id: int, db: Session = Depends(get_db)):
    try:
        team = crud.get_saved_team(db, team_id)
    except SQLAlchemyError:
        logger.exception("Database error while fetching saved team")
        raise HTTPException(status_code=500, detail="Database error occurred while fetching saved team.")

    if not team:
        raise HTTPException(status_code=404, detail="Saved team not found.")
    return team


@router.delete("/saved-teams/{team_id}")
def delete_saved_team_endpoint(team_id: int, db: Session = Depends(get_db)):
    try:
        deleted = crud.delete_saved_team(db, team_id)
    except SQLAlchemyError:
        logger.exception("Database error while deleting saved team")
        raise HTTPException(status_code=500, detail="Database error occurred while deleting saved team.")

    if not deleted:
        raise HTTPException(status_code=404, detail="Saved team not found.")
    return {"message": "Saved team deleted successfully"}


@router.delete("/saved-teams")
def clear_saved_teams_endpoint(db: Session = Depends(get_db)):
    try:
        count = crud.clear_saved_teams(db)
        return {"message": f"Cleared {count} saved team(s)."}
    except SQLAlchemyError:
        logger.exception("Database error while clearing saved teams")
        raise HTTPException(status_code=500, detail="Database error occurred while clearing saved teams.")