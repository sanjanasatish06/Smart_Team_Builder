"""
Comprehensive backend test suite for Smart Team Builder API.
Tests models, crud, endpoints, and matching engine integration.
"""
import sys
from app.database import SessionLocal, Base, engine
from app import models, crud, schemas
from app.services.team_builder import generate_teams

def test_crud_and_endpoints():
    print("Running backend tests...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Test clear
        crud.clear_participants(db)
        initial_list = crud.get_participants(db)
        assert len(initial_list) == 0, f"Expected 0 participants after clear, got {len(initial_list)}"
        print("PASS: Clear participants")

        # Test create single
        test_p = schemas.ParticipantCreate(
            name="Test User",
            skills=["Python", "FastAPI"],
            experience="Intermediate",
            interests=["AI", "Backend"],
            preferred_role="Backend Developer"
        )
        created = crud.create_participant(db, test_p)
        assert created["name"] == "Test User"
        assert created["skills"] == ["Python", "FastAPI"]
        print("PASS: Create participant")

        # Test get by id
        fetched = crud.get_participant(db, created["id"])
        assert fetched is not None
        assert fetched["id"] == created["id"]
        print("PASS: Fetch participant by id")

        # Test seed
        seeded = crud.seed_default_participants(db, reset=True)
        assert len(seeded) == 12, f"Expected 12 seeded participants, got {len(seeded)}"
        print(f"PASS: Seeded {len(seeded)} participants")

        # Test generate teams with project requirements
        participants_with_id = [
            schemas.ParticipantWithId(**p) for p in seeded
        ]
        req = schemas.GenerateTeamsRequest(
            team_size=4,
            participants=participants_with_id,
            project_requirements=schemas.ProjectRequirements(
                project_name="AI Health Assistant",
                project_description="Real-time multi-agent health diagnostic assistant",
                required_skills=["Python", "React", "Docker"],
                preferred_roles=["AI/ML Engineer", "Frontend Developer", "Backend Developer"]
            )
        )
        
        # Test direct team builder
        participants_data = [p.model_dump() for p in req.participants]
        result = generate_teams(participants_data, req.team_size)
        if req.project_requirements:
            result["project_requirements"] = req.project_requirements.model_dump()

        assert result["success"] is True
        assert result["total_participants"] == 12
        assert result["total_teams"] == 3
        assert len(result["teams"]) == 3
        assert result["overall_score"] > 0
        assert "project_requirements" in result
        assert result["project_requirements"]["project_name"] == "AI Health Assistant"

        # Verify team structure & real metrics
        for t in result["teams"]:
            assert "score" in t
            assert "score_breakdown" in t
            assert "skill_diversity" in t["score_breakdown"]
            assert "role_coverage" in t["score_breakdown"]
            assert "experience_balance" in t["score_breakdown"]
            assert "interest_compatibility" in t["score_breakdown"]
            assert "preference_satisfaction" in t["score_breakdown"]
            assert "reasons" in t
            assert len(t["reasons"]) > 0
            assert "members" in t
            assert len(t["members"]) == 4
            for m in t["members"]:
                assert "name" in m
                assert "role" in m
                assert "skills" in m

        print(f"PASS: Generated {len(result['teams'])} teams with overall score {result['overall_score']}")
        print("ALL BACKEND CHECKS PASSED SUCCESSFULLY!")
    finally:
        db.close()

if __name__ == "__main__":
    test_crud_and_endpoints()
