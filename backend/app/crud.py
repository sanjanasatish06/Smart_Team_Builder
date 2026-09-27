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