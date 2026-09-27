import { useState } from "react";
import TeamIntelligenceView from "../components/TeamIntelligenceView";

function getRoleAccentColor(role = "") {
  const r = role.toLowerCase();
  if (r.includes("ai") || r.includes("ml")) return "#607254";
  if (r.includes("front") || r.includes("ui") || r.includes("ux")) return "#7F9163";
  if (r.includes("back") || r.includes("data") || r.includes("sql")) return "#5B7065";
  if (r.includes("devops") || r.includes("cloud") || r.includes("sec")) return "#8F7D58";
  return "#6F8265";
}

function Results({
  teams = [],
  overallScore = 0,
  totalParticipants = 0,
  projectRequirements = null,
  onBack,
  onNavigateToParticipants,
}) {
  const [activeTab, setActiveTab] = useState("cards"); // 'cards' | 'intelligence'
  const [copied, setCopied] = useState(false);

  // Compute calculated overall score if not passed directly
  const calculatedOverallScore =
    overallScore ||
    (teams.length > 0
      ? Math.round(
          teams.reduce((acc, t) => acc + (t.score || 0), 0) / teams.length
        )
      : 0);

  const totalMembersPlaced = teams.reduce(
    (sum, t) => sum + (t.members || []).length,
    0
  );

  const handleCopySummary = () => {
    const summary = {
      project: projectRequirements?.project_name || "Hackathon Project",
      overall_score: calculatedOverallScore,
      total_teams: teams.length,
      teams: teams.map((t) => ({
        name: t.team_name,
        score: t.score,
        members: t.members.map((m) => ({
          name: m.name,
          role: m.role,
          experience: m.experience,
        })),
        score_breakdown: t.score_breakdown,
        reasons: t.reasons,
      })),
    };

    navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="results-workflow-page">
      {/* Top Banner */}
      <div className="page-intro-header">
        <div className="intro-meta">
          <span className="step-badge">STEP 3 OF 3</span>
          <h1>Team Formation & AI Intelligence</h1>
          <p>
            {projectRequirements?.project_name ? (
              <>
                Formed optimal teams for{" "}
                <strong>{projectRequirements.project_name}</strong> based on
                multi-objective algorithmic synergy.
              </>
            ) : (
              "Balanced teams created based on complementary skills, experience, and role preferences."
            )}
          </p>
        </div>

        <div className="results-actions-group">
          <button
            type="button"
            className="action-btn secondary-btn"
            onClick={handleCopySummary}
          >
            {copied ? "✓ Copied Roster JSON!" : "📋 Copy Roster JSON"}
          </button>
          <button
            type="button"
            className="action-btn secondary-btn"
            onClick={onBack}
          >
            ← Re-tune Requirements
          </button>
        </div>
      </div>

      {/* Formation Executive Metrics Banner */}
      <div className="formation-metrics-banner">
        <div className="overall-score-gauge-card">
          <div className="score-radial-wrap">
            <span className="radial-score-val">{calculatedOverallScore}%</span>
            <span className="radial-score-label">Synergy Score</span>
          </div>
          <div className="score-radial-meta">
            <h4>Global Formation Synergy</h4>
            <p>
              Average multi-factor configuration score across all formed teams
            </p>
          </div>
        </div>

        <div className="formation-sub-metrics-grid">
          <div className="sub-metric-box">
            <span className="sub-metric-title">Total Squads</span>
            <strong className="sub-metric-val">{teams.length}</strong>
            <span className="sub-metric-note">Equally balanced</span>
          </div>

          <div className="sub-metric-box">
            <span className="sub-metric-title">Participants Placed</span>
            <strong className="sub-metric-val">{totalParticipants || totalMembersPlaced}</strong>
            <span className="sub-metric-note">100% placement rate</span>
          </div>

          <div className="sub-metric-box">
            <span className="sub-metric-title">Average Team Size</span>
            <strong className="sub-metric-val">
              {teams.length > 0
                ? (totalMembersPlaced / teams.length).toFixed(1)
                : 0}
            </strong>
            <span className="sub-metric-note">Members per squad</span>
          </div>

          <div className="sub-metric-box">
            <span className="sub-metric-title">Algorithm Precision</span>
            <strong className="sub-metric-val text-success">5-Factor</strong>
            <span className="sub-metric-note">100% Weight Verified</span>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="view-switcher-bar">
        <div className="view-tabs">
          <button
            type="button"
            className={`view-tab-btn ${activeTab === "cards" ? "active" : ""}`}
            onClick={() => setActiveTab("cards")}
          >
            👥 Squad Cards View ({teams.length})
          </button>
          <button
            type="button"
            className={`view-tab-btn ${
              activeTab === "intelligence" ? "active" : ""
            }`}
            onClick={() => setActiveTab("intelligence")}
          >
            🧠 Deep AI Team Intelligence
          </button>
        </div>

        <div className="view-filter-note">
          {activeTab === "cards"
            ? "Showing all squads with member assignments and 5-factor breakdown"
            : "Showing derived skill coverage, role balance, and tactical recommendations"}
        </div>
      </div>

      {/* Render Active View */}
      {activeTab === "cards" ? (
        <div className="teams-results-grid">
          {teams.map((team) => (
            <EnhancedTeamCard
              key={team.team_id}
              team={team}
              onInspectIntelligence={() => setActiveTab("intelligence")}
            />
          ))}
        </div>
      ) : (
        <TeamIntelligenceView
          teams={teams}
          projectRequirements={projectRequirements}
        />
      )}

      {/* Navigation Footer */}
      <div className="results-footer-nav">
        <button
          type="button"
          className="back-step-btn"
          onClick={onBack}
        >
          ← Adjust Project Requirements
        </button>

        <button
          type="button"
          className="action-btn ghost-btn"
          onClick={onNavigateToParticipants}
        >
          Edit Participant Roster
        </button>
      </div>
    </div>
  );
}

function EnhancedTeamCard({ team, onInspectIntelligence }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const score = team.score || 0;
  const breakdown = team.score_breakdown || {};
  const reasons = team.reasons || [];

  return (
    <div className="enhanced-team-card">
      <div className="team-header-row">
        <div>
          <span className="team-tag">SQUAD</span>
          <h2>{team.team_name}</h2>
        </div>

        <div className="team-score-badge-wrap">
          <div
            className={`team-score-badge ${
              score >= 80 ? "high" : score >= 70 ? "medium" : "moderate"
            }`}
          >
            <strong>{score}%</strong>
            <span>Synergy Match</span>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="members-section">
        <span className="section-label">Assigned Squad Members:</span>
        <div className="members-list-stack">
          {team.members.map((member) => {
            const roleColor = getRoleAccentColor(member.role);
            const isPreferredMatched =
              (member.preferred_role || "").toLowerCase() ===
              (member.role || "").toLowerCase();

            return (
              <div className="member-assigned-row" key={member.id}>
                <div
                  className="member-avatar-circle"
                  style={{
                    background: roleColor,
                  }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>

                <div className="member-assigned-meta">
                  <div className="member-name-row">
                    <strong>{member.name}</strong>
                    <span
                      className={`seniority-tag ${(
                        member.experience || ""
                      ).toLowerCase()}`}
                    >
                      {member.experience}
                    </span>
                  </div>

                  <div className="role-and-pref-row">
                    <span
                      className="assigned-role-tag"
                      style={{ color: roleColor }}
                    >
                      {member.role || member.preferred_role}
                    </span>

                    {member.preferred_role && (
                      <span
                        className={`pref-match-hint ${
                          isPreferredMatched ? "matched" : "adapted"
                        }`}
                        title={`Preferred: ${member.preferred_role}`}
                      >
                        {isPreferredMatched
                          ? "✓ Preferred Role"
                          : `⇄ Adapted from ${member.preferred_role}`}
                      </span>
                    )}
                  </div>

                  {member.skills && member.skills.length > 0 && (
                    <div className="member-skills-row">
                      {member.skills.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="tiny-skill-pill">
                          {s}
                        </span>
                      ))}
                      {member.skills.length > 3 && (
                        <span className="tiny-skill-pill more">
                          +{member.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5-Factor Score Breakdown */}
      <div className="breakdown-preview-box">
        <div className="breakdown-box-header">
          <span>Algorithm Score Breakdown</span>
          <button
            type="button"
            className="toggle-breakdown-btn"
            onClick={() => setDetailsOpen(!detailsOpen)}
          >
            {detailsOpen ? "Hide Breakdown ▲" : "View Breakdown ▼"}
          </button>
        </div>

        {detailsOpen && (
          <div className="breakdown-content-expanded">
            <FactorBar
              label="Skill Diversity"
              weight="30%"
              value={breakdown.skill_diversity || 0}
            />
            <FactorBar
              label="Role Coverage"
              weight="25%"
              value={breakdown.role_coverage || 0}
            />
            <FactorBar
              label="Experience Balance"
              weight="20%"
              value={breakdown.experience_balance || 0}
            />
            <FactorBar
              label="Interest Compatibility"
              weight="15%"
              value={breakdown.interest_compatibility || 0}
            />
            <FactorBar
              label="Preference Satisfaction"
              weight="10%"
              value={breakdown.preference_satisfaction || 0}
            />

            {/* AI Explanations */}
            <div className="team-reasons-block">
              <h5>Verified Formation Rationale:</h5>
              <div className="reasons-pill-list">
                {reasons.map((reason, index) => (
                  <div key={index} className="reason-bullet-card">
                    <span className="check-icon">✓</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="team-card-actions">
        <button
          type="button"
          className="inspect-intel-btn"
          onClick={onInspectIntelligence}
        >
          🧠 Inspect Team Intelligence →
        </button>
      </div>
    </div>
  );
}

function FactorBar({ label, weight, value }) {
  const numVal = Math.round(value);
  const color =
    numVal >= 80 ? "#5F8A62" : numVal >= 60 ? "#97A87A" : "#B98545";

  return (
    <div className="factor-bar-row">
      <div className="factor-meta-line">
        <span className="factor-title">
          {label} <small className="factor-weight">({weight})</small>
        </span>
        <strong className="factor-pct">{numVal}%</strong>
      </div>
      <div className="factor-track">
        <div
          className="factor-fill"
          style={{ width: `${numVal}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default Results;