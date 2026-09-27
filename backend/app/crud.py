import json
import uuid
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


def clear_participants(db: Session) -> int:
    deleted_count = db.query(models.Participant).delete()
    db.commit()
    return deleted_count


DEFAULT_SAMPLE_PARTICIPANTS = [
    {
        "name": "Shravya",
        "skills": ["Python", "Machine Learning", "React"],
        "experience": "Intermediate",
        "interests": ["AI", "Web Development"],
        "preferred_role": "AI/ML Engineer",
    },
    {
        "name": "Rahul",
        "skills": ["React", "JavaScript", "Node.js"],
        "experience": "Advanced",
        "interests": ["Web Development", "SaaS"],
        "preferred_role": "Frontend Developer",
    },
    {
        "name": "Ananya",
        "skills": ["Figma", "UI/UX", "Canva"],
        "experience": "Intermediate",
        "interests": ["Design", "Education"],
        "preferred_role": "UI/UX Designer",
    },
    {
        "name": "Kiran",
        "skills": ["Public Speaking", "Pitch Decks", "Marketing"],
        "experience": "Beginner",
        "interests": ["Startups", "Business"],
        "preferred_role": "Presenter",
    },
    {
        "name": "Frank",
        "skills": ["SQL", "Statistics", "Python"],
        "experience": "Beginner",
        "interests": ["Data", "AI"],
        "preferred_role": "Data Analyst",
    },
    {
        "name": "Emma",
        "skills": ["Java", "Spring Boot", "REST APIs"],
        "experience": "Advanced",
        "interests": ["Backend Systems", "Cloud"],
        "preferred_role": "Backend Developer",
    },
    {
        "name": "David",
        "skills": ["Docker", "AWS", "CI/CD"],
        "experience": "Advanced",
        "interests": ["Cloud", "Infrastructure"],
        "preferred_role": "DevOps Engineer",
    },
    {
        "name": "Grace",
        "skills": ["Network Security", "Penetration Testing"],
        "experience": "Intermediate",
        "interests": ["Security", "Ethical Hacking"],
        "preferred_role": "Cybersecurity Engineer",
    },
    {
        "name": "Charlie",
        "skills": ["PostgreSQL", "Database Design", "SQL"],
        "experience": "Intermediate",
        "interests": ["Data", "Backend Systems"],
        "preferred_role": "Database Engineer",
    },
    {
        "name": "Priya",
        "skills": ["Swift", "Kotlin", "Flutter"],
        "experience": "Beginner",
        "interests": ["Mobile Apps", "Design"],
        "preferred_role": "Mobile Developer",
    },
    {
        "name": "Arjun",
        "skills": ["Scrum", "Jira", "Roadmapping"],
        "experience": "Advanced",
        "interests": ["Startups", "Business"],
        "preferred_role": "Project Manager",
    },
    {
        "name": "Meera",
        "skills": ["Literature Review", "Data Collection", "Academic Writing"],
        "experience": "Intermediate",
        "interests": ["Education", "AI"],
        "preferred_role": "Researcher",
    },
]


def seed_default_participants(db: Session, reset: bool = False) -> list[dict]:
    if reset:
        db.query(models.Participant).delete()

    for p in DEFAULT_SAMPLE_PARTICIPANTS:
        db_participant = models.Participant(
            name=p["name"],
            skills=json.dumps(p["skills"]),
            experience=p["experience"],
            interests=json.dumps(p["interests"]),
            preferred_role=p["preferred_role"],
        )
        db.add(db_participant)
    db.commit()
    return get_participants(db)


def _saved_team_row_to_dict(row: models.SavedTeam) -> dict:
    save_type = getattr(row, "save_type", None)
    if not save_type:
        save_type = "formation" if row.group_id else "individual"
    return {
        "id": row.id,
        "group_id": row.group_id,
        "save_type": save_type,
        "team_name": row.team_name,
        "score": row.score,
        "score_breakdown": json.loads(row.score_breakdown) if row.score_breakdown else {},
        "reasons": json.loads(row.reasons) if row.reasons else [],
        "members": json.loads(row.members) if row.members else [],
        "participant_ids": json.loads(row.participant_ids) if row.participant_ids else [],
        "project_name": row.project_name,
        "project_description": row.project_description,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


def save_teams(db: Session, request: schemas.SaveTeamsRequest) -> list[dict]:
    save_type = request.save_type
    if not save_type:
        if len(request.teams) == 1 and not request.group_id:
            save_type = "individual"
        else:
            save_type = "formation"

    if save_type == "individual":
        group_id = request.group_id or None
    else:
        group_id = request.group_id or f"formation_{uuid.uuid4().hex[:10]}"

    project_name = request.project_name
    project_desc = request.project_description
    if not project_name and request.project_requirements:
        project_name = request.project_requirements.project_name
        project_desc = request.project_requirements.project_description

    saved_rows = []
    for team in request.teams:
        p_ids = team.participant_ids
        if p_ids is None:
            p_ids = [m.get("id") for m in team.members if isinstance(m, dict) and m.get("id") is not None]

        team_save_type = team.save_type or save_type

        row = models.SavedTeam(
            group_id=group_id if team_save_type != "individual" else (request.group_id or None),
            save_type=team_save_type,
            team_name=team.team_name,
            score=team.score,
            score_breakdown=json.dumps(team.score_breakdown),
            reasons=json.dumps(team.reasons),
            members=json.dumps(team.members),
            participant_ids=json.dumps(p_ids),
            project_name=team.project_name or project_name,
            project_description=team.project_description or project_desc,
        )
        db.add(row)
        saved_rows.append(row)

    db.commit()
    for row in saved_rows:
        db.refresh(row)
    return [_saved_team_row_to_dict(r) for r in saved_rows]


def get_saved_teams(
    db: Session,
    group_id: str | None = None,
    save_type: str | None = None,
) -> list[dict]:
    query = db.query(models.SavedTeam)
    if group_id:
        query = query.filter(models.SavedTeam.group_id == group_id)
    if save_type:
        if save_type == "individual":
            query = query.filter(
                (models.SavedTeam.save_type == "individual") | (models.SavedTeam.group_id.is_(None))
            )
        elif save_type == "formation":
            query = query.filter(
                (models.SavedTeam.save_type == "formation") & (models.SavedTeam.group_id.isnot(None))
            )
    rows = query.order_by(models.SavedTeam.id.desc()).all()
    return [_saved_team_row_to_dict(r) for r in rows]


def get_categorized_saved_teams(db: Session) -> dict:
    all_rows = get_saved_teams(db)
    individual_teams = []
    formations_map = {}

    for t in all_rows:
        if t.get("save_type") == "individual" or not t.get("group_id"):
            individual_teams.append(t)
        else:
            gid = t["group_id"]
            if gid not in formations_map:
                formations_map[gid] = {
                    "group_id": gid,
                    "project_name": t.get("project_name"),
                    "project_description": t.get("project_description"),
                    "created_at": t.get("created_at"),
                    "teams": [],
                }
            formations_map[gid]["teams"].append(t)

    formations = list(formations_map.values())
    return {
        "teams": all_rows,
        "individual_teams": individual_teams,
        "formations": formations,
        "total": len(all_rows),
    }


def get_saved_team(db: Session, team_id: int) -> dict | None:
    row = db.query(models.SavedTeam).filter(models.SavedTeam.id == team_id).first()
    if row is None:
        return None
    return _saved_team_row_to_dict(row)


def delete_saved_team(db: Session, team_id: int) -> bool:
    row = db.query(models.SavedTeam).filter(models.SavedTeam.id == team_id).first()
    if row is None:
        return False
    db.delete(row)
    db.commit()
    return True


def clear_saved_teams(db: Session) -> int:
    deleted_count = db.query(models.SavedTeam).delete()
    db.commit()
    return deleted_count
