function Results({ teams, onBack }) {
  return (
    <div className="results-page">
      <div className="results-header">
        <div>
          <p className="page-label">RESULTS</p>

          <h1>Your Teams Are Ready</h1>

          <p>
            Balanced teams created based on skills, roles,
            experience, interests, and preferences.
          </p>
        </div>

        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
      </div>

      <div className="teams-grid">
        {teams.map((team) => (
          <TeamCard key={team.team_id} team={team} />
        ))}
      </div>
    </div>
  );
}

function TeamCard({ team }) {
  return (
    <div className="result-team-card">

      <div className="team-card-header">
        <div>
          <span>TEAM</span>
          <h2>{team.team_name}</h2>
        </div>

        <div className="compatibility-score">
          <strong>{team.score}%</strong>
          <span>Compatibility</span>
        </div>
      </div>

      <div className="team-members">
        {team.members.map((member) => (
          <div className="result-member" key={member.id}>
            <div className="result-avatar">
              {member.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{member.name}</strong>
              <span>{member.role}</span>
            </div>
          </div>
        ))}
      </div>

      <details className="reasoning">
        <summary>
          Why this team?
        </summary>

        <div className="reasoning-content">

          <h3>Score Breakdown</h3>

          <ScoreBar
            label="Skill Diversity"
            value={team.score_breakdown.skill_diversity}
          />

          <ScoreBar
            label="Role Coverage"
            value={team.score_breakdown.role_coverage}
          />

          <ScoreBar
            label="Experience Balance"
            value={team.score_breakdown.experience_balance}
          />

          <ScoreBar
            label="Interest Compatibility"
            value={team.score_breakdown.interest_compatibility}
          />

          <ScoreBar
            label="Preference Satisfaction"
            value={team.score_breakdown.preference_satisfaction}
          />

          <div className="reasons">
            <h3>Why this team?</h3>

            {team.reasons.map((reason, index) => (
              <p key={index}>
                ✓ {reason}
              </p>
            ))}
          </div>

        </div>
      </details>

    </div>
  );
}

function ScoreBar({ label, value }) {
  return (
    <div className="score-bar">

      <div className="score-bar-header">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>

      <div className="score-track">
        <div
          className="score-fill"
          style={{ width: `${value}%` }}
        ></div>
      </div>

    </div>
  );
}

export default Results;