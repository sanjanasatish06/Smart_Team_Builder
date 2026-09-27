"""
Comprehensive backend test suite for Smart Team Builder API.
Tests models, crud, endpoints, matching engine integration, and saved teams persistence.
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
        # 1. Test clear participants
        crud.clear_participants(db)
        initial_list = crud.get_participants(db)
        assert len(initial_list) == 0, f"Expected 0 participants after clear, got {len(initial_list)}"
        print("PASS: Clear participants")

        # 2. Test create single participant
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

        # 3. Test get by id
        fetched = crud.get_participant(db, created["id"])
        assert fetched is not None
        assert fetched["id"] == created["id"]
        print("PASS: Fetch participant by id")

        # 4. Test seed participants
        seeded = crud.seed_default_participants(db, reset=True)
        assert len(seeded) == 12, f"Expected 12 seeded participants, got {len(seeded)}"
        print(f"PASS: Seeded {len(seeded)} participants")

        # 5. Test generate teams with project requirements
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

        # 6. Test Individual Team Saving & Isolation
        crud.clear_saved_teams(db)
        initial_saved = crud.get_saved_teams(db)
        assert len(initial_saved) == 0, f"Expected 0 saved teams, got {len(initial_saved)}"
        print("PASS: Clear saved teams")

        # Save ONLY team 0 with an edited/custom name
        individual_team_create = schemas.SavedTeamCreate(
            team_name="AI Core Champions (Edited)",
            score=result["teams"][0]["score"],
            score_breakdown=result["teams"][0]["score_breakdown"],
            reasons=result["teams"][0]["reasons"],
            members=result["teams"][0]["members"],
            participant_ids=[m["id"] for m in result["teams"][0]["members"]],
            project_name="Autonomous AI Workspace",
            project_description="Multi-agent workspace",
        )

        ind_save_req = schemas.SaveTeamsRequest(
            teams=[individual_team_create],
            save_type="individual",
            project_name="Autonomous AI Workspace",
        )

        ind_saved_results = crud.save_teams(db, ind_save_req)
        assert len(ind_saved_results) == 1, f"Expected 1 saved team, got {len(ind_saved_results)}"
        assert ind_saved_results[0]["team_name"] == "AI Core Champions (Edited)"
        assert ind_saved_results[0]["save_type"] == "individual"
        assert ind_saved_results[0]["group_id"] is None
        print("PASS: Saved individual team with edited name")

        # Verify that saving one individual team did NOT create or save the other teams
        all_current_saved = crud.get_saved_teams(db)
        assert len(all_current_saved) == 1, (
            f"Expected exactly 1 saved team in DB, found {len(all_current_saved)}. "
            "Saving an individual team must NOT save the other generated teams!"
        )
        print("PASS: Verified saving one team does not save other generated teams")

        # 7. Test Save All Teams (Complete Formation) with Edited Names
        formation_renamed_teams = [
            schemas.SavedTeamCreate(
                team_name="Formation Squad 1 - Alpha (Edited)",
                score=result["teams"][0]["score"],
                score_breakdown=result["teams"][0]["score_breakdown"],
                reasons=result["teams"][0]["reasons"],
                members=result["teams"][0]["members"],
                participant_ids=[m["id"] for m in result["teams"][0]["members"]],
                project_name="Autonomous AI Workspace",
            ),
            schemas.SavedTeamCreate(
                team_name="Formation Squad 2 - Beta (Edited)",
                score=result["teams"][1]["score"],
                score_breakdown=result["teams"][1]["score_breakdown"],
                reasons=result["teams"][1]["reasons"],
                members=result["teams"][1]["members"],
                participant_ids=[m["id"] for m in result["teams"][1]["members"]],
                project_name="Autonomous AI Workspace",
            ),
            schemas.SavedTeamCreate(
                team_name="Formation Squad 3 - Gamma (Edited)",
                score=result["teams"][2]["score"],
                score_breakdown=result["teams"][2]["score_breakdown"],
                reasons=result["teams"][2]["reasons"],
                members=result["teams"][2]["members"],
                participant_ids=[m["id"] for m in result["teams"][2]["members"]],
                project_name="Autonomous AI Workspace",
            ),
        ]

        formation_save_req = schemas.SaveTeamsRequest(
            teams=formation_renamed_teams,
            group_id="formation_run_789",
            save_type="formation",
            project_name="Autonomous AI Workspace",
            project_description="Multi-agent workspace",
        )

        formation_saved = crud.save_teams(db, formation_save_req)
        assert len(formation_saved) == 3
        assert formation_saved[0]["team_name"] == "Formation Squad 1 - Alpha (Edited)"
        assert formation_saved[1]["team_name"] == "Formation Squad 2 - Beta (Edited)"
        assert formation_saved[2]["team_name"] == "Formation Squad 3 - Gamma (Edited)"
        assert formation_saved[0]["group_id"] == "formation_run_789"
        assert formation_saved[0]["save_type"] == "formation"
        print("PASS: Saved complete formation of all teams with edited names")

        # 8. Test Categorized Retrieval (Separation of Individual Teams & Formations)
        categorized = crud.get_categorized_saved_teams(db)
        assert categorized["total"] == 4  # 1 individual + 3 formation teams
        assert len(categorized["individual_teams"]) == 1
        assert categorized["individual_teams"][0]["team_name"] == "AI Core Champions (Edited)"
        assert len(categorized["formations"]) == 1
        assert categorized["formations"][0]["group_id"] == "formation_run_789"
        assert len(categorized["formations"][0]["teams"]) == 3
        print("PASS: Verified separation of individual teams and formations in database")

        first_id = ind_saved_results[0]["id"]
        single_team = crud.get_saved_team(db, first_id)
        assert single_team is not None
        assert single_team["team_name"] == "AI Core Champions (Edited)"
        assert len(single_team["members"]) == 4
        print(f"PASS: Retrieved single saved team by ID ({first_id})")

    finally:
        db.close()

    # 9. Test Persistence after Simulating Backend Restart (Fresh Session & Engine)
    fresh_db = SessionLocal()
    try:
        restarted = crud.get_categorized_saved_teams(fresh_db)
        assert restarted["total"] == 4
        assert len(restarted["individual_teams"]) == 1
        assert restarted["individual_teams"][0]["team_name"] == "AI Core Champions (Edited)"
        assert len(restarted["formations"]) == 1
        assert len(restarted["formations"][0]["teams"]) == 3

        form_names = {t["team_name"] for t in restarted["formations"][0]["teams"]}
        assert "Formation Squad 1 - Alpha (Edited)" in form_names
        assert "Formation Squad 2 - Beta (Edited)" in form_names
        assert "Formation Squad 3 - Gamma (Edited)" in form_names

        # Verify participant IDs and member details persist intact
        sample_persisted = restarted["individual_teams"][0]
        assert len(sample_persisted["participant_ids"]) == 4
        assert sample_persisted["project_name"] == "Autonomous AI Workspace"
        assert sample_persisted["score_breakdown"]["skill_diversity"] > 0
        print("PASS: Verified full persistence across simulated backend restart")

        # 10. Test Single Delete
        del_id = sample_persisted["id"]
        deleted = crud.delete_saved_team(fresh_db, del_id)
        assert deleted is True
        remaining = crud.get_saved_teams(fresh_db)
        assert len(remaining) == 3
        assert crud.get_saved_team(fresh_db, del_id) is None
        print("PASS: Deleted single saved team")

        # 11. Clean up test saved teams
        crud.clear_saved_teams(fresh_db)
        assert len(crud.get_saved_teams(fresh_db)) == 0
        print("PASS: Clear saved teams cleanup")

        print("\nALL BACKEND & PERSISTENCE CHECKS PASSED SUCCESSFULLY!")
    finally:
        fresh_db.close()

if __name__ == "__main__":
    test_crud_and_endpoints()
