"""
Seed script — run once to populate the database with sample participants.

Usage (from inside backend/, with venv activated):
    python seed_data.py
"""

from app.database import SessionLocal, Base, engine
from app import models
import json

Base.metadata.create_all(bind=engine)

SAMPLE_PARTICIPANTS = [
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


def seed():
    db = SessionLocal()
    try:
        existing_count = db.query(models.Participant).count()
        if existing_count > 0:
            print(f"Database already has {existing_count} participant(s). Skipping seed to avoid duplicates.")
            print("If you want to reseed from scratch, delete smart_team_builder.db and run this script again.")
            return

        for p in SAMPLE_PARTICIPANTS:
            db_participant = models.Participant(
                name=p["name"],
                skills=json.dumps(p["skills"]),
                experience=p["experience"],
                interests=json.dumps(p["interests"]),
                preferred_role=p["preferred_role"],
            )
            db.add(db_participant)

        db.commit()
        print(f"Seeded {len(SAMPLE_PARTICIPANTS)} participants successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()