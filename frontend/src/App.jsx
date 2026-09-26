import { useState } from "react";
import Participants from "./pages/Participants";
import TeamConfig from "./pages/TeamConfig";
import Results from "./pages/Results";
import { sampleTeams } from "./data/sampleData";
import LoadingState from "./components/LoadingState";
import ErrorMessage from "./components/ErrorMessage";

function App() {
  const [page, setPage] = useState("home");
const [participants, setParticipants] = useState([]);
const [teams, setTeams] = useState(sampleTeams);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const createMockTeams = (participants, teamSize) => {
  const generatedTeams = [];

  for (let i = 0; i < participants.length; i += teamSize) {
    const members = participants.slice(i, i + teamSize);

    generatedTeams.push({
      team_id: generatedTeams.length + 1,
      team_name: `Team ${String.fromCharCode(65 + generatedTeams.length)}`,
      score: 90,
      members: members.map((member) => ({
        id: member.id,
        name: member.name,
        role: member.preferred_role,
      })),
      score_breakdown: {
        skill_diversity: 90,
        role_coverage: 88,
        experience_balance: 89,
        interest_compatibility: 91,
        preference_satisfaction: 90,
      },
      reasons: [
        "Good skill diversity",
        "Balanced team size",
        "Compatible interests",
        "Members are assigned to their preferred roles",
      ],
    });
  }

  return generatedTeams;
};

if (page === "participants") {
  return (
    <Participants
      onContinue={(participantData) => {
        setParticipants(participantData);
        setPage("config");
      }}
    />
  );
}

if (page === "config") {
  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      {error && <ErrorMessage message={error} />}

      <TeamConfig
        participants={participants}
        onGenerate={(data) => {
  setError("");
  setLoading(true);

  console.log("Team generation data:", data);

  setTimeout(() => {
    const generatedTeams = createMockTeams(
      data.participants,
      data.team_size
    );

    setTeams(generatedTeams);
    setLoading(false);
    setPage("results");
  }, 1500);
}}
      />
    </>
  );
}
if (page === "results") {
  return (
    <Results
      teams={teams}
      onBack={() => setPage("config")}
    />
  );
}

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          Smart Team Builder
        </div>

        <button
          className="nav-button"
          onClick={() => setPage("participants")}
        >
          Get Started
        </button>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <div className="badge">
            AI-Assisted Team Formation
          </div>

          <h1>
            Build Better Teams.
            <br />
            <span>Work Smarter.</span>
          </h1>

          <p>
            Create balanced, diverse, and compatible teams based on
            skills, experience, interests, and preferred roles.
          </p>

          <button
            className="primary-button"
            onClick={() => setPage("participants")}
          >
            Create Teams →
          </button>

          <div className="features">
            <div className="feature">
              <strong>✓</strong>
              <span>Skill-based matching</span>
            </div>

            <div className="feature">
              <strong>✓</strong>
              <span>Balanced experience</span>
            </div>

            <div className="feature">
              <strong>✓</strong>
              <span>Role diversity</span>
            </div>

            <div className="feature">
              <strong>✓</strong>
              <span>Explainable formation</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="team-preview">
            <div className="preview-header">
              <div>
                <p>Generated Team</p>
                <h3>Team Alpha</h3>
              </div>

              <div className="score">91%</div>
            </div>

            <div className="members">
              <div className="member">
                <div className="avatar">S</div>
                <div>
                  <strong>Shravya</strong>
                  <small>AI/ML Engineer</small>
                </div>
              </div>

              <div className="member">
                <div className="avatar">R</div>
                <div>
                  <strong>Rahul</strong>
                  <small>Frontend Developer</small>
                </div>
              </div>

              <div className="member">
                <div className="avatar">A</div>
                <div>
                  <strong>Ananya</strong>
                  <small>UI/UX Designer</small>
                </div>
              </div>

              <div className="member">
                <div className="avatar">K</div>
                <div>
                  <strong>Kiran</strong>
                  <small>Presenter</small>
                </div>
              </div>
            </div>

            <div className="match">
              <div className="match-title">
                <span>Team Compatibility</span>
                <strong>91%</strong>
              </div>

              <div className="progress">
                <div className="progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;