import { useState } from "react";
import { deriveTeamIntelligence } from "../utils/teamIntelligence";

function TeamIntelligenceView({ teams, projectRequirements }) {
  const [selectedTeamId, setSelectedTeamId] = useState(
    teams && teams.length > 0 ? teams[0].team_id : null
  );

  const intelligenceList = (teams || []).map((t) =>
    deriveTeamIntelligence(t, projectRequirements)
  );

  const activeIntelligence =
    intelligenceList.find((item) => item?.teamId === selectedTeamId) ||
    intelligenceList[0];

  if (!activeIntelligence) {
    return (
      <div className="empty-intelligence">
        <p>No team intelligence available.</p>
      </div>
    );
  }

  return (
    <div className="team-intelligence-container">
      <div className="intelligence-header">
        <div>
          <span className="section-pill">AI DERIVED ANALYTICS</span>
          <h2>Deep Squad Intelligence & Execution Readiness</h2>
          <p>
            Deterministic analysis computed directly from verified backend
            scoring weights, role assignments, and project requirements.
          </p>
        </div>

        {/* Squad Selector Tabs */}
        <div className="squad-selector-tabs">
          {intelligenceList.map((item) => (
            <button
              type="button"
              key={item.teamId}
              className={`squad-tab-btn ${
                item.teamId === activeIntelligence.teamId ? "active" : ""
              }`}
              onClick={() => setSelectedTeamId(item.teamId)}
            >
              <span className="squad-tab-name">{item.teamName}</span>
              <span
                className="squad-tab-score"
                style={{ color: item.readinessColor }}
              >
                {item.compositeReadinessScore}%
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="intelligence-main-grid">
        {/* Left Column: Readiness, Role Distribution & Skill Coverage */}
        <div className="intel-col">
          {/* Readiness Card */}
          <div className="intel-card readiness-card">
            <div className="readiness-top">
              <div>
                <span className="card-sub-label">Derived Readiness Score</span>
                <h3>{activeIntelligence.readinessLevel}</h3>
              </div>
              <div
                className="readiness-gauge"
                style={{ borderColor: activeIntelligence.readinessColor }}
              >
                <span>{activeIntelligence.compositeReadinessScore}%</span>
              </div>
            </div>

            <p className="readiness-summary">
              Calculated from core matching algorithm compatibility (
              {activeIntelligence.teamScore}%)
              {projectRequirements?.required_skills?.length > 0 &&
                ` blended with project skill coverage (${activeIntelligence.skillCoveragePct}%)`}
              .
            </p>
          </div>

          {/* Skill Coverage Analysis */}
          <div className="intel-card">
            <div className="intel-card-header">
              <h4>Skill Coverage & Inventory</h4>
              <span className="metric-tag">
                {activeIntelligence.skillCoveragePct}% Coverage
              </span>
            </div>

            {projectRequirements?.required_skills?.length > 0 ? (
              <div className="skill-analysis-block">
                <div className="analysis-sub-group">
                  <span className="sub-group-title text-success">
                    ✓ Matched Project Requirements (
                    {activeIntelligence.matchedRequiredSkills.length}/
                    {projectRequirements.required_skills.length})
                  </span>
                  <div className="tags-flex">
                    {activeIntelligence.matchedRequiredSkills.length > 0 ? (
                      activeIntelligence.matchedRequiredSkills.map((skill) => (
                        <span key={skill} className="skill-pill matched">
                          ✓ {skill}
                        </span>
                      ))
                    ) : (
                      <span className="muted-text">None matched directly</span>
                    )}
                  </div>
                </div>

                {activeIntelligence.missingRequiredSkills.length > 0 && (
                  <div className="analysis-sub-group">
                    <span className="sub-group-title text-warning">
                      ⚠️ Missing Project Skills (
                      {activeIntelligence.missingRequiredSkills.length})
                    </span>
                    <div className="tags-flex">
                      {activeIntelligence.missingRequiredSkills.map((skill) => (
                        <span key={skill} className="skill-pill missing">
                          ✕ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="muted-text">
                No specific required project skills specified; team possesses a
                diverse inventory of {activeIntelligence.allTeamSkills.length}{" "}
                unique technical skills.
              </p>
            )}

            <div className="inventory-skills-list">
              <span className="sub-group-title">Full Squad Skill Arsenal:</span>
              <div className="tags-flex">
                {activeIntelligence.allTeamSkills.map((s) => (
                  <span key={s} className="skill-pill">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Role & Seniority Composition */}
          <div className="intel-card">
            <div className="intel-card-header">
              <h4>Role & Seniority Composition</h4>
              <span className="metric-tag">
                Role Score: {activeIntelligence.breakdown.role_coverage}%
              </span>
            </div>

            <div className="role-distribution-list">
              {Object.entries(activeIntelligence.roleCounts).map(
                ([role, count]) => (
                  <div key={role} className="role-count-row">
                    <span className="role-name">{role}</span>
                    <div className="role-count-bar-wrapper">
                      <div
                        className="role-count-bar"
                        style={{ width: `${Math.min(100, count * 35)}%` }}
                      />
                      <span className="count-label">{count} member{count > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="seniority-summary-row">
              <span className="seniority-label">Seniority Balance:</span>
              <div className="seniority-badges-wrap">
                <span className="seniority-tag beginner">
                  {activeIntelligence.expCounts.Beginner} Beginner
                </span>
                <span className="seniority-tag intermediate">
                  {activeIntelligence.expCounts.Intermediate} Intermediate
                </span>
                <span className="seniority-tag advanced">
                  {activeIntelligence.expCounts.Advanced} Advanced
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Strengths, Gaps, Risks, and Recommendations */}
        <div className="intel-col">
          {/* Core Strengths */}
          <div className="intel-card">
            <div className="intel-card-header">
              <h4>Verified Squad Strengths</h4>
              <span className="metric-tag success-tag">Algorithm Highlights</span>
            </div>

            <div className="insights-list">
              {activeIntelligence.strengths.map((str, idx) => (
                <div key={idx} className="insight-item strength">
                  <div className="insight-bullet">💪</div>
                  <div className="insight-text">
                    <strong>{str.title}</strong>
                    <p>{str.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gaps & Risk Watchpoints */}
          <div className="intel-card">
            <div className="intel-card-header">
              <h4>Identified Gaps & Risk Watchpoints</h4>
              <span className="metric-tag warning-tag">Action Items</span>
            </div>

            {activeIntelligence.risksAndGaps.length === 0 ? (
              <div className="no-risks-notice">
                <span>✓</span> No critical skill bottlenecks or seniority imbalances
                detected.
              </div>
            ) : (
              <div className="insights-list">
                {activeIntelligence.risksAndGaps.map((risk, idx) => (
                  <div
                    key={idx}
                    className={`insight-item risk ${risk.severity || "low"}`}
                  >
                    <div className="insight-bullet">⚠️</div>
                    <div className="insight-text">
                      <strong>{risk.title}</strong>
                      <p>{risk.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tactical Recommendations */}
          <div className="intel-card recommendations-card">
            <div className="intel-card-header">
              <h4>Tactical Recommendations</h4>
              <span className="metric-tag info-tag">Execution Strategy</span>
            </div>

            <div className="recommendations-list">
              {activeIntelligence.recommendations.map((rec, idx) => (
                <div key={idx} className="recommendation-row">
                  <span className="rec-number">{idx + 1}</span>
                  <p>{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Backend AI Rationale */}
          <div className="intel-card rationale-card">
            <div className="intel-card-header">
              <h4>Matching Engine Explanations</h4>
              <span className="metric-tag">Backend Rationale</span>
            </div>

            <ul className="reasons-bullet-list">
              {activeIntelligence.reasons.map((reason, index) => (
                <li key={index}>
                  <span className="bullet-check">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamIntelligenceView;
