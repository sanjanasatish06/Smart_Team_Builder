import { useState } from "react";
import Participants from "./pages/participants";
import ProjectSetup from "./pages/ProjectSetup";
import Results from "./pages/Results";
import LoadingState from "./components/LoadingState";
import ErrorMessage from "./components/ErrorMessage";
import WorkflowHeader from "./components/WorkflowHeader";
import SavedTeamsView from "./components/SavedTeamsView";
import { generateTeams, seedParticipants } from "./services/api";

function App() {
  const [page, setPage] = useState("home"); // 'home' | 'participants' | 'project' | 'results'
  const [participants, setParticipants] = useState([]);
  const [projectRequirements, setProjectRequirements] = useState({
    project_name: "Autonomous AI Workspace",
    project_description:
      "Multi-agent autonomous workspace for distributed engineering teams with real-time sync.",
    team_size: 3,
    required_skills: ["Python", "React", "SQL"],
    preferred_roles: ["AI/ML Engineer", "Frontend Developer", "Backend Developer"],
  });
  const [teams, setTeams] = useState([]);
  const [overallScore, setOverallScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (requestPayload) => {
    setError("");
    setLoading(true);

    try {
      const response = await generateTeams(requestPayload);
      setTeams(response.teams || []);
      setOverallScore(response.overall_score || 0);
      setLoading(false);
      setPage("results");
    } catch (err) {
      setLoading(false);
      setError(err.message || "Failed to generate teams. Please check backend connection.");
    }
  };

  const handleQuickDemo = async () => {
    setDemoLoading(true);
    setError("");
    try {
      const response = await seedParticipants(true);
      setParticipants(response.participants || []);
      setDemoLoading(false);
      setPage("participants");
    } catch {
      setDemoLoading(false);
      // Fallback: transition to participants anyway
      setPage("participants");
    }
  };

  // Workflow navigation handlers
  const handleWorkflowNavigate = (targetStep) => {
    setError("");
    if (targetStep === "home") setPage("home");
    else if (targetStep === "saved") setPage("saved");
    else if (targetStep === "participants") setPage("participants");
    else if (targetStep === "project" || targetStep === "config") {
      if (participants.length >= 2) setPage("project");
      else setError("Please add at least 2 participants before proceeding.");
    } else if (targetStep === "results") {
      if (teams.length > 0) setPage("results");
    }
  };

  return (
    <div className="app">
      {/* Workflow Navigation Header shown during workflow */}
      {page !== "home" && (
        <WorkflowHeader
          currentStep={page}
          onNavigate={handleWorkflowNavigate}
          participantCount={participants.length}
        />
      )}

      {error && (
        <div className="app-error-floating">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading && <LoadingState />}

      {/* STEP 1: PARTICIPANTS */}
      {page === "participants" && !loading && (
        <Participants
          participants={participants}
          setParticipants={setParticipants}
          onContinue={() => setPage("project")}
        />
      )}

      {/* STEP 2: PROJECT REQUIREMENTS & TEAM CONFIG */}
      {page === "project" && !loading && (
        <ProjectSetup
          participants={participants}
          projectRequirements={projectRequirements}
          setProjectRequirements={setProjectRequirements}
          onGenerate={handleGenerate}
          onBack={() => setPage("participants")}
        />
      )}

      {/* STEP 3: RESULTS & AI TEAM INTELLIGENCE */}
      {page === "results" && !loading && (
        <Results
          teams={teams}
          overallScore={overallScore}
          totalParticipants={participants.length}
          projectRequirements={projectRequirements}
          onBack={() => setPage("project")}
          onNavigateToParticipants={() => setPage("participants")}
          onTeamsChange={setTeams}
        />
      )}

      {/* SAVED TEAMS VIEW */}
      {page === "saved" && !loading && (
        <div className="saved-teams-page-container">
          <SavedTeamsView
            onBack={() => setPage(teams.length > 0 ? "results" : "participants")}
            onNavigateToBuilder={() => setPage("participants")}
          />
        </div>
      )}

      {/* LANDING PAGE */}
      {page === "home" && (
        <div className="landing-container">
          <nav className="navbar">
            <div className="logo-group">
              <div className="brand-logo-icon">⚡</div>
              <div>
                <span className="logo">Smart Team Builder</span>
                <span className="version-pill">v2.0 • AI-Assisted</span>
              </div>
            </div>

            <div className="nav-right">
              <button
                className="nav-secondary-btn"
                onClick={() => setPage("saved")}
                title="View Saved Teams & Formations"
              >
                📁 Saved Teams
              </button>
              <button
                className="nav-secondary-btn"
                onClick={handleQuickDemo}
                disabled={demoLoading}
              >
                {demoLoading ? "Seeding..." : "⚡ Quick Demo (12 Hackers)"}
              </button>
              <button
                className="nav-button"
                onClick={() => setPage("participants")}
              >
                Launch Builder →
              </button>
            </div>
          </nav>

          <main className="hero">
            <div className="hero-content">
              <div className="badge">
                <span className="badge-pulse" />
                Multi-Factor AI Matching Engine
              </div>

              <h1>
                Build Winning Hackathon Teams.
                <br />
                <span>Zero Guesswork.</span>
              </h1>

              <p className="hero-subheading">
                Transform a scattered roster of participants into highly
                cohesive, multi-disciplinary squads. Our 5-factor optimization
                engine balances complementary skills, functional roles,
                seniority tiers, and domain interests with complete explainability.
              </p>

              <div className="hero-cta-group">
                <button
                  className="primary-button hero-cta"
                  onClick={() => setPage("participants")}
                >
                  Start Building Teams →
                </button>

                <button
                  className="secondary-outline-button"
                  onClick={handleQuickDemo}
                  disabled={demoLoading}
                >
                  ⚡ Try 12-Person Live Demo
                </button>
              </div>

              {/* 5-Factor Feature Pillars */}
              <div className="pillars-grid">
                <div className="pillar-item">
                  <span className="pillar-pct">30%</span>
                  <div className="pillar-meta">
                    <strong>Skill Diversity</strong>
                    <span>Complementary stacks</span>
                  </div>
                </div>

                <div className="pillar-item">
                  <span className="pillar-pct">25%</span>
                  <div className="pillar-meta">
                    <strong>Role Coverage</strong>
                    <span>End-to-end disciplines</span>
                  </div>
                </div>

                <div className="pillar-item">
                  <span className="pillar-pct">20%</span>
                  <div className="pillar-meta">
                    <strong>Seniority Balance</strong>
                    <span>Mentors + execution</span>
                  </div>
                </div>

                <div className="pillar-item">
                  <span className="pillar-pct">15%</span>
                  <div className="pillar-meta">
                    <strong>Interest Alignment</strong>
                    <span>Shared domain focus</span>
                  </div>
                </div>

                <div className="pillar-item">
                  <span className="pillar-pct">10%</span>
                  <div className="pillar-meta">
                    <strong>Role Satisfaction</strong>
                    <span>Individual preference</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Interactive Synergy Simulator Preview Card */}
            <div className="hero-visual">
              <div className="team-preview-glass">
                <div className="preview-top-badge">
                  <span>LIVE FORMATION PREVIEW</span>
                  <span className="verified-pill">✓ 100% Explainable</span>
                </div>

                <div className="preview-header">
                  <div>
                    <span className="preview-team-label">OPTIMAL SQUAD 1</span>
                    <h3>Team Alpha</h3>
                    <p className="preview-track-hint">Track: Autonomous AI Workspace</p>
                  </div>

                  <div className="preview-synergy-badge">
                    <strong>91.4%</strong>
                    <span>Synergy</span>
                  </div>
                </div>

                <div className="preview-members-stack">
                  <div className="preview-member-item">
                    <div className="preview-avatar ai">S</div>
                    <div className="preview-member-meta">
                      <div className="preview-member-name">
                        <strong>Shravya</strong>
                        <span className="seniority-tag intermediate">Intermediate</span>
                      </div>
                      <small className="preview-member-role">AI/ML Engineer</small>
                    </div>
                  </div>

                  <div className="preview-member-item">
                    <div className="preview-avatar front">R</div>
                    <div className="preview-member-meta">
                      <div className="preview-member-name">
                        <strong>Rahul</strong>
                        <span className="seniority-tag advanced">Advanced</span>
                      </div>
                      <small className="preview-member-role">Frontend Developer</small>
                    </div>
                  </div>

                  <div className="preview-member-item">
                    <div className="preview-avatar ux">A</div>
                    <div className="preview-member-meta">
                      <div className="preview-member-name">
                        <strong>Ananya</strong>
                        <span className="seniority-tag intermediate">Intermediate</span>
                      </div>
                      <small className="preview-member-role">UI/UX Designer</small>
                    </div>
                  </div>

                  <div className="preview-member-item">
                    <div className="preview-avatar back">E</div>
                    <div className="preview-member-meta">
                      <div className="preview-member-name">
                        <strong>Emma</strong>
                        <span className="seniority-tag advanced">Advanced</span>
                      </div>
                      <small className="preview-member-role">Backend Developer</small>
                    </div>
                  </div>
                </div>

                <div className="preview-breakdown-mini">
                  <div className="mini-metric-row">
                    <span>Skill Diversity: 92%</span>
                    <span>Role Coverage: 100%</span>
                  </div>
                  <div className="progress">
                    <div className="progress-fill" style={{ width: "91%" }} />
                  </div>
                </div>

                <div className="preview-rationale-snippet">
                  <span className="snippet-icon">✓</span>
                  <span>
                    Balanced mix of advanced mentors and agile builders covering all
                    key stack layers.
                  </span>
                </div>
              </div>
            </div>
          </main>

          {/* How It Works Section */}
          <section className="how-it-works-section">
            <div className="section-title-wrap">
              <span className="section-pill">HOW IT WORKS</span>
              <h2>Four Steps from Roster to Synergistic Squads</h2>
            </div>

            <div className="steps-cards-grid">
              <div className="step-card">
                <div className="step-number">01</div>
                <h4>Assemble Talent Roster</h4>
                <p>
                  Register participants with their exact technical skills,
                  seniority tiers, domain interests, and preferred roles.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">02</div>
                <h4>Define Project Goals</h4>
                <p>
                  Set squad size targets, required core tech stacks, and desired
                  functional roles using pre-built hackathon templates.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">03</div>
                <h4>5-Factor Synergy Match</h4>
                <p>
                  Hill-climbing combinatorial optimization evaluates millions of
                  permutations to maximize global team harmony and role fit.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">04</div>
                <h4>AI Team Intelligence</h4>
                <p>
                  Review deterministic skill coverage, role balance, strengths,
                  gaps, risks, and tactical mentorship recommendations.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;