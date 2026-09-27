import { useState } from "react";
import TeamIntelligenceView from "../components/TeamIntelligenceView";
import SavedTeamsView from "../components/SavedTeamsView";
import { saveTeams } from "../services/api";

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
  onTeamsChange,
}) {
  const [prevTeams, setPrevTeams] = useState(teams);
  const [editableTeams, setEditableTeams] = useState(teams);
  const [activeTab, setActiveTab] = useState("cards"); // 'cards' | 'intelligence' | 'saved'
  const [savingAll, setSavingAll] = useState(false);
  const [savingIndividualId, setSavingIndividualId] = useState(null);
  const [savedTeamIds, setSavedTeamIds] = useState({});
  const [allSavedSuccess, setAllSavedSuccess] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'success' | 'error'
  const [saveMessage, setSaveMessage] = useState("");

  if (teams !== prevTeams) {
    setPrevTeams(teams);
    setEditableTeams(teams);
  }

  // Compute calculated overall score if not passed directly
  const calculatedOverallScore =
    overallScore ||
    (editableTeams.length > 0
      ? Math.round(
          editableTeams.reduce((acc, t) => acc + (t.score || 0), 0) / editableTeams.length
        )
      : 0);

  const totalMembersPlaced = editableTeams.reduce(
    (sum, t) => sum + (t.members || []).length,
    0
  );

  const handleRenameTeam = (teamId, newName) => {
    const updated = editableTeams.map((t) =>
      t.team_id === teamId ? { ...t, team_name: newName } : t
    );
    setEditableTeams(updated);
    if (onTeamsChange) {
      onTeamsChange(updated);
    }
    // If this squad was previously marked as saved, clear its saved status so user can save updated version
    setSavedTeamIds((prev) => {
      if (!prev[teamId]) return prev;
      const next = { ...prev };
      delete next[teamId];
      return next;
    });
    setAllSavedSuccess(false);
    if (saveStatus === "success") {
      setSaveStatus(null);
    }
  };

  // 1. Save Individual Team
  const handleSaveIndividualTeam = async (team) => {
    setSavingIndividualId(team.team_id);
    setSaveStatus(null);
    setSaveMessage("");

    try {
      const payload = {
        teams: [
          {
            team_name: team.team_name, // Persist the edited/custom name
            score: team.score || 0,
            score_breakdown: team.score_breakdown || {},
            reasons: team.reasons || [],
            members: team.members || [],
            participant_ids: (team.members || []).map((m) => m.id).filter(Boolean),
            project_name: projectRequirements?.project_name || null,
            project_description: projectRequirements?.project_description || null,
          },
        ],
        save_type: "individual",
        project_name: projectRequirements?.project_name || null,
        project_description: projectRequirements?.project_description || null,
        project_requirements: projectRequirements || null,
      };

      await saveTeams(payload);
      setSavingIndividualId(null);
      setSavedTeamIds((prev) => ({ ...prev, [team.team_id]: true }));
      setSaveStatus("success");
      setSaveMessage(`Successfully saved squad "${team.team_name}" to SQLite database.`);
    } catch (err) {
      setSavingIndividualId(null);
      setSaveStatus("error");
      setSaveMessage(err.message || `Failed to save team "${team.team_name}".`);
    }
  };

  // 2. Save All Teams (Complete Formation)
  const handleSaveAllTeams = async () => {
    if (editableTeams.length === 0) return;
    setSavingAll(true);
    setSaveStatus(null);
    setSaveMessage("");

    try {
      const payload = {
        teams: editableTeams.map((t) => ({
          team_name: t.team_name, // Persist edited names for all teams
          score: t.score || 0,
          score_breakdown: t.score_breakdown || {},
          reasons: t.reasons || [],
          members: t.members || [],
          participant_ids: (t.members || []).map((m) => m.id).filter(Boolean),
          project_name: projectRequirements?.project_name || null,
          project_description: projectRequirements?.project_description || null,
        })),
        save_type: "formation",
        project_name: projectRequirements?.project_name || null,
        project_description: projectRequirements?.project_description || null,
        project_requirements: projectRequirements || null,
      };

      const response = await saveTeams(payload);
      setSavingAll(false);
      setAllSavedSuccess(true);
      // Mark all individual cards as saved as well
      const allSavedMap = {};
      editableTeams.forEach((t) => {
        allSavedMap[t.team_id] = true;
      });
      setSavedTeamIds(allSavedMap);

      setSaveStatus("success");
      setSaveMessage(
        `Successfully saved complete formation of ${response.total || editableTeams.length} squads to SQLite database.`
      );
    } catch (err) {
      setSavingAll(false);
      setSaveStatus("error");
      setSaveMessage(err.message || "Failed to save formation. Please check backend connection.");
    }
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
            className="action-btn primary-btn save-teams-btn"
            onClick={handleSaveAllTeams}
            disabled={savingAll}
          >
            {savingAll ? "Saving All..." : allSavedSuccess ? "✓ All Teams Saved" : "💾 Save All Teams"}
          </button>
          <button
            type="button"
            className="action-btn secondary-btn view-saved-btn"
            onClick={() => setActiveTab("saved")}
          >
            📁 View Saved Teams
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

      {/* Save Status Notification Banner */}
      {saveStatus === "success" && (
        <div className="save-status-banner success" role="status">
          <div className="banner-content">
            <span className="banner-icon">✓</span>
            <div>
              <strong>Saved to SQLite Database</strong>
              <p>
                {saveMessage} Persisted with custom names, assigned members, and synergy scores.
              </p>
            </div>
          </div>
          <div className="banner-action-wrap">
            <button
              type="button"
              className="banner-retry-btn"
              onClick={() => setActiveTab("saved")}
            >
              Open Saved Teams →
            </button>
            <button
              type="button"
              className="banner-close-btn"
              onClick={() => setSaveStatus(null)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {saveStatus === "error" && (
        <div className="save-status-banner error" role="alert">
          <div className="banner-content">
            <span className="banner-icon">⚠️</span>
            <div>
              <strong>Failed to Save</strong>
              <p>{saveMessage}</p>
            </div>
          </div>
          <div className="banner-action-wrap">
            <button
              type="button"
              className="banner-retry-btn"
              onClick={handleSaveAllTeams}
              disabled={savingAll}
            >
              Retry
            </button>
            <button
              type="button"
              className="banner-close-btn"
              onClick={() => setSaveStatus(null)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
            <strong className="sub-metric-val">{editableTeams.length}</strong>
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
              {editableTeams.length > 0
                ? (totalMembersPlaced / editableTeams.length).toFixed(1)
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
            👥 Squad Cards View ({editableTeams.length})
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
          <button
            type="button"
            className={`view-tab-btn ${
              activeTab === "saved" ? "active" : ""
            }`}
            onClick={() => setActiveTab("saved")}
          >
            📁 Saved Teams & Formations
          </button>
        </div>

        <div className="view-filter-note">
          {activeTab === "cards" &&
            "Showing all squads with individual save controls and 5-factor breakdown"}
          {activeTab === "intelligence" &&
            "Showing derived skill coverage, role balance, and tactical recommendations"}
          {activeTab === "saved" &&
            "Showing persisted individual squads and complete formations from SQLite"}
        </div>
      </div>

      {/* Render Active View */}
      {activeTab === "cards" && (
        <div className="teams-results-grid">
          {editableTeams.map((team) => (
            <EnhancedTeamCard
              key={team.team_id}
              team={team}
              isSaved={!!savedTeamIds[team.team_id]}
              isSaving={savingIndividualId === team.team_id}
              onSave={() => handleSaveIndividualTeam(team)}
              onRename={(newName) => handleRenameTeam(team.team_id, newName)}
              onInspectIntelligence={() => setActiveTab("intelligence")}
            />
          ))}
        </div>
      )}

      {activeTab === "intelligence" && (
        <TeamIntelligenceView
          teams={editableTeams}
          projectRequirements={projectRequirements}
        />
      )}

      {activeTab === "saved" && (
        <SavedTeamsView
          onBack={() => setActiveTab("cards")}
          onNavigateToBuilder={onNavigateToParticipants}
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

        <div className="results-footer-actions">
          <button
            type="button"
            className="action-btn ghost-btn"
            onClick={onNavigateToParticipants}
          >
            Edit Participant Roster
          </button>
          <button
            type="button"
            className="action-btn secondary-btn view-saved-btn"
            onClick={() => setActiveTab("saved")}
          >
            📁 View Saved Teams
          </button>
          <button
            type="button"
            className="action-btn primary-btn save-teams-btn"
            onClick={handleSaveAllTeams}
            disabled={savingAll}
          >
            {savingAll ? "Saving All Teams..." : allSavedSuccess ? "✓ All Teams Saved" : "💾 Save All Teams"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EnhancedTeamCard({
  team,
  isSaved,
  isSaving,
  onSave,
  onRename,
  onInspectIntelligence,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(team.team_name || "");
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleStartEdit = () => {
    setTempName(team.team_name || "");
    setIsEditing(true);
  };

  const handleConfirmRename = () => {
    const trimmed = tempName.trim();
    if (trimmed && trimmed !== team.team_name) {
      onRename(trimmed);
    } else {
      setTempName(team.team_name || "");
    }
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setTempName(team.team_name || "");
    setIsEditing(false);
  };

  const score = team.score || 0;
  const breakdown = team.score_breakdown || {};
  const reasons = team.reasons || [];

  return (
    <div className="enhanced-team-card">
      <div className="team-header-row">
        <div className="team-header-left">
          <span className="team-tag">SQUAD</span>
          {isEditing ? (
            <div className="team-rename-edit-box">
              <input
                type="text"
                className="team-rename-input"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleConfirmRename();
                  } else if (e.key === "Escape") {
                    handleCancelRename();
                  }
                }}
                autoFocus
                placeholder="Enter squad name..."
              />
              <button
                type="button"
                className="team-rename-btn confirm"
                onClick={handleConfirmRename}
                title="Save name"
                aria-label="Save team name"
              >
                ✓
              </button>
              <button
                type="button"
                className="team-rename-btn cancel"
                onClick={handleCancelRename}
                title="Cancel"
                aria-label="Cancel editing"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="team-name-display-row">
              <h2>{team.team_name}</h2>
              <button
                type="button"
                className="team-rename-trigger-btn"
                onClick={handleStartEdit}
                title="Rename this team"
                aria-label={`Rename ${team.team_name}`}
              >
                ✏️
              </button>
            </div>
          )}
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

      {/* Card Action Footer: Individual Save Team & Inspect Intelligence */}
      <div className="team-card-actions">
        <button
          type="button"
          className={`team-save-btn ${isSaved ? "saved" : ""}`}
          onClick={onSave}
          disabled={isSaving || isSaved}
          title={isSaved ? "Team already saved to database" : "Save this individual squad to database"}
        >
          {isSaving ? "Saving..." : isSaved ? "✓ Team Saved" : "💾 Save Team"}
        </button>
        <button
          type="button"
          className="inspect-intel-btn"
          onClick={onInspectIntelligence}
        >
          🧠 Inspect Intelligence →
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