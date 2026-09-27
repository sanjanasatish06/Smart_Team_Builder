import { useEffect, useState, useMemo } from "react";
import ParticipantForm from "../components/ParticipantForm";
import ParticipantCard from "../components/ParticipantCard";
import ErrorMessage from "../components/ErrorMessage";
import {
  addParticipant,
  getParticipants,
  deleteParticipant,
  seedParticipants,
  clearParticipants,
} from "../services/api";

function Participants({ participants, setParticipants, onContinue }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const loadParticipantsData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getParticipants();
      setParticipants(response.participants || []);
    } catch (err) {
      setError(err.message || "Failed to load participants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    getParticipants()
      .then((response) => {
        if (!ignore) {
          setParticipants(response.participants || []);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || "Failed to load participants.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [setParticipants]);

  const handleAdd = async (participantData) => {
    setError("");
    setSubmitting(true);
    try {
      await addParticipant(participantData);
      await loadParticipantsData();
    } catch (err) {
      setError(err.message || "Failed to add participant.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id) => {
    setError("");
    try {
      await deleteParticipant(id);
      setParticipants((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete participant.");
    }
  };

  const handleSeed = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await seedParticipants(true);
      setParticipants(response.participants || []);
    } catch (err) {
      setError(err.message || "Failed to seed sample participants.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear all participants from the roster?")) {
      return;
    }
    setError("");
    setLoading(true);
    try {
      await clearParticipants();
      setParticipants([]);
    } catch (err) {
      setError(err.message || "Failed to clear roster.");
    } finally {
      setLoading(false);
    }
  };

  // Derived roster statistics
  const stats = useMemo(() => {
    const total = participants.length;
    const allSkills = new Set(
      participants.flatMap((p) => (p.skills || []).map((s) => s.toLowerCase()))
    );
    const expCounts = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    const rolesMap = {};

    participants.forEach((p) => {
      const exp = p.experience || "Intermediate";
      if (expCounts[exp] !== undefined) expCounts[exp] += 1;
      const r = p.preferred_role || "Other";
      rolesMap[r] = (rolesMap[r] || 0) + 1;
    });

    return {
      total,
      uniqueSkills: allSkills.size,
      expCounts,
      uniqueRoles: Object.keys(rolesMap).length,
      rolesMap,
    };
  }, [participants]);

  // Filtered participants list
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchesSearch =
        searchTerm === "" ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.skills || []).some((s) =>
          s.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        (p.preferred_role || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole =
        roleFilter === "all" ||
        (p.preferred_role || "").toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [participants, searchTerm, roleFilter]);

  return (
    <div className="participants-workflow-page">
      <div className="page-intro-header">
        <div className="intro-meta">
          <span className="step-badge">STEP 1 OF 3</span>
          <h1>Assemble Participant Roster</h1>
          <p>
            Build your talent pool of developers, designers, and domain specialists.
            Add individual profiles or quickly seed realistic hackathon participants.
          </p>
        </div>

        <div className="roster-quick-actions">
 {participants.length === 0 && (
  <button
    type="button"
    className="action-btn secondary-btn"
    onClick={handleSeed}
    disabled={loading}
  >
    ⚡ Load Sample Hackathon Roster (12)
  </button>
)}

{participants.length > 0 && (
  <button
    type="button"
    className="action-btn ghost-danger-btn"
    onClick={handleClear}
    disabled={loading}
  >
    Clear Roster
  </button>
)}
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Roster Analytics Bar */}
      <div className="roster-analytics-bar">
        <div className="metric-box">
          <span className="metric-title">Total Participants</span>
          <div className="metric-value-row">
            <strong>{stats.total}</strong>
            <span className="metric-hint">
              {stats.total < 2
                ? "Min 2 required"
                : stats.total < 4
                ? "Ready for 1 team"
                : `Ready for ${Math.floor(stats.total / 3)}-${Math.floor(
                    stats.total / 2
                  )} teams`}
            </span>
          </div>
        </div>

        <div className="metric-box">
          <span className="metric-title">Unique Skills</span>
          <div className="metric-value-row">
            <strong>{stats.uniqueSkills}</strong>
            <span className="metric-hint">In talent pool</span>
          </div>
        </div>

        <div className="metric-box">
          <span className="metric-title">Roles Covered</span>
          <div className="metric-value-row">
            <strong>{stats.uniqueRoles}</strong>
            <span className="metric-hint">Functional roles</span>
          </div>
        </div>

        <div className="metric-box">
          <span className="metric-title">Seniority Spread</span>
          <div className="experience-spread-pills">
            <span className="exp-spread-tag beg">
              {stats.expCounts.Beginner} Beg
            </span>
            <span className="exp-spread-tag int">
              {stats.expCounts.Intermediate} Int
            </span>
            <span className="exp-spread-tag adv">
              {stats.expCounts.Advanced} Adv
            </span>
          </div>
        </div>
      </div>

      <div className="participant-split-layout">
        <div className="form-column">
          <ParticipantForm onAdd={handleAdd} isSubmitting={submitting} />
        </div>

        <div className="roster-column">
          <div className="roster-section-top">
            <div className="roster-title-area">
              <h3>Current Roster ({filteredParticipants.length})</h3>
              <p>Active participants awaiting project matching</p>
            </div>

            {participants.length > 0 && (
              <div className="roster-filter-row">
                <input
                  type="text"
                  placeholder="Search by name, skill, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="roster-search-input"
                />

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="roster-role-filter"
                >
                  <option value="all">All Roles</option>
                  {Object.keys(stats.rolesMap).map((role) => (
                    <option key={role} value={role}>
                      {role} ({stats.rolesMap[role]})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="empty-state-card">
              <div className="loading-spinner-inline" />
              <h3>Loading talent roster...</h3>
              <p>Retrieving registered participants from the database</p>
            </div>
          ) : participants.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-state-icon">👥</div>
              <h3>No Participants in Roster</h3>
              <p>
                Add participants using the form on the left, or click below to
                instantly load a 12-person hackathon roster with balanced skills.
              </p>
              <button
                type="button"
                className="action-btn primary-btn"
                onClick={handleSeed}
              >
                ⚡ Populate Sample Roster
              </button>
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div className="empty-state-card">
              <h3>No Matching Participants</h3>
              <p>Try adjusting your search query or role filter.</p>
              <button
                type="button"
                className="action-btn secondary-btn"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("all");
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="participant-cards-flow">
              {filteredParticipants.map((participant) => (
                <ParticipantCard
                  key={participant.id}
                  participant={participant}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}

          {/* Bottom Next Step Bar */}
          <div className="roster-bottom-nav">
            <div className="roster-status-note">
              {participants.length < 2 ? (
                <span className="warning-text">
                  ⚠️ Need at least 2 participants to form teams (currently{" "}
                  {participants.length})
                </span>
              ) : (
                <span className="ready-text">
                  ✓ {participants.length} participants ready for project
                  requirements
                </span>
              )}
            </div>

            <button
              type="button"
              className="proceed-btn"
              disabled={participants.length < 2}
              onClick={onContinue}
            >
              Continue to Project Requirements →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Participants;