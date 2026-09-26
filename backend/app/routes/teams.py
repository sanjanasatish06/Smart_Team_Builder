import logging
from fastapi import APIRouter, HTTPException

from app import schemas
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
    except Exception:
        logger.exception("Matching engine raised an exception during generate_teams()")
        raise HTTPException(status_code=500, detail="Matching engine failed to generate teams.")

    return result