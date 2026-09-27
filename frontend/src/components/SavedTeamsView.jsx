import { useState, useEffect, useCallback } from "react";
import { getSavedTeams, deleteSavedTeam } from "../services/api";

function getRoleAccentColor(role = "") {
  const r = role.toLowerCase();
  if (r.includes("ai") || r.includes("ml")) return "#607254";
  if (r.includes("front") || r.includes("ui") || r.includes("ux")) return "#7F9163";
  if (r.includes("back") || r.includes("data") || r.includes("sql")) return "#5B7065";
  if (r.includes("devops") || r.includes("cloud") || r.includes("sec")) return "#8F7D58";
  return "#6F8265";
}

function formatDate(isoStr) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoStr;
  }
}

function SavedTeamsView({ onBack, onNavigateToBuilder }) {
  const [data, setData] = useState({
    teams: [],
    individual_teams: [],
    formations: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'individual' | 'formations'
  const [deletingId, setDeletingId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    getSavedTeams()
      .then((response) => {
        if (!ignore) {
          setData({
            teams: response.teams || [],
            individual_teams: response.individual_teams || [],
            formations: response.formations || [],
            total: response.total || 0,
          });
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || "Failed to load saved teams from SQLite database.");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [refreshTrigger]);

  const loadSavedData = useCallback(() => {
    setLoading(true);
    setError("");
    setRefreshTrigger((c) => c + 1);
  }, []);

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to remove this saved team?")) {
      return;
    }
    setDeletingId(teamId);
    try {
      await deleteSavedTeam(teamId);
      loadSavedData();
    } catch (err) {
      alert(err.message || "Failed to delete saved team.");
    } finally {
      setDeletingId(null);
    }
  };

  const individualTeams = data.individual_teams || [];
  const formations = data.formations || [];

  return (
    <div className="saved-teams-view-page">
      {/* Header */}
      <div className="saved-view-header">
        <div>
          <span className="section-pill">SQLITE PERSISTENCE LAYER</span>
          <h2>Saved Teams & Formations</h2>
          <p>
            Review individually saved squads and complete formations persisted directly in the local SQLite database.
          </p>
        </div>

        <div className="saved-view-header-actions">
          <button
            type="button"
            className="action-btn secondary-btn"
            onClick={loadSavedData}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "🔄 Refresh"}
          </button>
          {onBack && (
            <button
              type="button"
              className="action-btn ghost-btn"
              onClick={onBack}
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="saved-filter-bar">
        <div className="saved-filter-tabs">
          <button
            type="button"
            className={`saved-tab-btn ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            All Saved ({data.total})
          </button>
          <button
            type="button"
            className={`saved-tab-btn ${activeFilter === "individual" ? "active" : ""}`}
            onClick={() => setActiveFilter("individual")}
          >
            ⭐ Individual Squads ({individualTeams.length})
          </button>
          <button
            type="button"
            className={`saved-tab-btn ${activeFilter === "formations" ? "active" : ""}`}
            onClick={() => setActiveFilter("formations")}
          >
            🏆 Complete Formations ({formations.length})
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="save-status-banner error">
          <div className="banner-content">
            <span className="banner-icon">⚠️</span>
            <div>
              <strong>Error Loading Saved Teams</strong>
              <p>{error}</p>
            </div>
          </div>
          <button
            type="button"
            className="banner-retry-btn"
            onClick={loadSavedData}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="saved-loading-state">
          <div className="loading-spinner" />
          <p>Reading persisted teams from SQLite database...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && data.total === 0 && (
        <div className="saved-empty-box">
          <div className="empty-icon">📁</div>
          <h3>No Saved Teams Yet</h3>
          <p>
            You haven't saved any teams yet. Form teams in the builder and click <strong>"Save Team"</strong> on individual squads or <strong>"Save All Teams"</strong> to persist them in SQLite.
          </p>
          {onNavigateToBuilder && (
            <button
              type="button"
              className="action-btn primary-btn"
              onClick={onNavigateToBuilder}
            >
              Go to Team Builder →
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {!loading && !error && data.total > 0 && (
        <div className="saved-content-stack">
          {/* SECTION 1: INDIVIDUAL TEAMS */}
          {(activeFilter === "all" || activeFilter === "individual") && (
            <div className="saved-section">
              <div className="saved-section-title-row">
                <div>
                  <h3>⭐ Saved Individual Squads</h3>
                  <span className="saved-section-subtitle">
                    {individualTeams.length === 0
                      ? "No individual squads saved yet."
                      : `${individualTeams.length} squad(s) saved individually.`}
                  </span>
                </div>
              </div>

              {individualTeams.length === 0 && activeFilter === "individual" && (
                <div className="empty-section-hint">
                  <p>No individual squads saved yet. On the Results page, click "Save Team" on any squad card to save it individually.</p>
                </div>
              )}

              {individualTeams.length > 0 && (
                <div className="saved-teams-grid">
                  {individualTeams.map((team) => (
                    <SavedIndividualCard
                      key={team.id}
                      team={team}
                      isDeleting={deletingId === team.id}
                      onDelete={() => handleDeleteTeam(team.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: FORMATIONS */}
          {(activeFilter === "all" || activeFilter === "formations") && (
            <div className="saved-section">
              <div className="saved-section-title-row">
                <div>
                  <h3>🏆 Saved Complete Formations</h3>
                  <span className="saved-section-subtitle">
                    {formations.length === 0
                      ? "No formations saved yet."
                      : `${formations.length} complete formation set(s) saved.`}
                  </span>
                </div>
              </div>

              {formations.length === 0 && activeFilter === "formations" && (
                <div className="empty-section-hint">
                  <p>No complete formations saved yet. On the Results page, click "Save All Teams" to persist an entire formation set.</p>
                </div>
              )}

              {formations.length > 0 && (
                <div className="saved-formations-stack">
                  {formations.map((form, idx) => (
                    <SavedFormationGroup
                      key={form.group_id || idx}
                      formation={form}
                      deletingId={deletingId}
                      onDeleteTeam={handleDeleteTeam}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SavedIndividualCard({ team, isDeleting, onDelete }) {
  const members = team.members || [];
  const score = Math.round(team.score || 0);

  return (
    <div className="saved-team-card">
      <div className="saved-team-card-header">
        <div>
          <span className="saved-card-tag">INDIVIDUAL SQUAD</span>
          <h4 className="saved-team-title">{team.team_name}</h4>
          {team.project_name && (
            <span className="saved-project-tag">
              🎯 {team.project_name}
            </span>
          )}
        </div>

        <div className="saved-score-badge">
          <strong>{score}%</strong>
          <span>Synergy</span>
        </div>
      </div>

      {team.created_at && (
        <div className="saved-time-meta">
          📅 Saved {formatDate(team.created_at)}
        </div>
      )}

      {/* Members */}
      <div className="saved-members-box">
        <span className="saved-members-count">
          Assigned Members ({members.length}):
        </span>
        <div className="saved-members-list">
          {members.map((m, idx) => {
            const roleColor = getRoleAccentColor(m.role);
            return (
              <div key={idx} className="saved-member-chip">
                <span
                  className="saved-avatar-dot"
                  style={{ background: roleColor }}
                >
                  {(m.name || "M").charAt(0).toUpperCase()}
                </span>
                <span className="saved-member-name">{m.name}</span>
                <span
                  className="saved-member-role"
                  style={{ color: roleColor }}
                >
                  ({m.role || m.preferred_role || "Member"})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rationale Bullet */}
      {team.reasons && team.reasons.length > 0 && (
        <div className="saved-reasons-preview">
          <span className="saved-reasons-label">Formation Rationale:</span>
          <p className="saved-reasons-text">✓ {team.reasons[0]}</p>
        </div>
      )}

      {/* Footer */}
      <div className="saved-card-footer">
        <span className="saved-id-pill">ID #{team.id}</span>
        <button
          type="button"
          className="saved-delete-btn"
          onClick={onDelete}
          disabled={isDeleting}
          title="Remove from saved teams"
        >
          {isDeleting ? "Deleting..." : "🗑️ Delete"}
        </button>
      </div>
    </div>
  );
}

function SavedFormationGroup({ formation, deletingId, onDeleteTeam }) {
  const teams = formation.teams || [];
  const avgScore =
    teams.length > 0
      ? Math.round(teams.reduce((s, t) => s + (t.score || 0), 0) / teams.length)
      : 0;

  return (
    <div className="saved-formation-card">
      <div className="formation-group-header">
        <div className="formation-meta-col">
          <span className="formation-tag">COMPLETE FORMATION SET</span>
          <h4>
            {formation.project_name
              ? `Formation: ${formation.project_name}`
              : `Formation Set (${formation.group_id})`}
          </h4>
          <span className="formation-date">
            Saved on {formatDate(formation.created_at)} • {teams.length} Squads
          </span>
        </div>

        <div className="formation-metrics-col">
          <div className="formation-avg-badge">
            <strong>{avgScore}%</strong>
            <span>Avg Synergy</span>
          </div>
        </div>
      </div>

      {/* Squads in this formation */}
      <div className="formation-squads-grid">
        {teams.map((team) => (
          <div key={team.id} className="formation-squad-item">
            <div className="formation-squad-top">
              <span className="formation-squad-name">{team.team_name}</span>
              <span className="formation-squad-score">
                {Math.round(team.score || 0)}%
              </span>
            </div>

            <div className="formation-squad-members">
              {(team.members || []).map((m, idx) => (
                <div key={idx} className="formation-mini-member">
                  <span className="mini-bullet">•</span>
                  <strong>{m.name}</strong>
                  <span className="mini-role">({m.role || "Member"})</span>
                </div>
              ))}
            </div>

            <div className="formation-squad-actions">
              <button
                type="button"
                className="mini-delete-btn"
                onClick={() => onDeleteTeam(team.id)}
                disabled={deletingId === team.id}
                title="Remove squad from formation"
              >
                {deletingId === team.id ? "..." : "🗑️ Remove"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SavedTeamsView;
