import React from "react";
function TeamConfig({ participants, onGenerate, onBack }) {
  const [teamSize, setTeamSize] = React.useState(2);
  const [error, setError] = React.useState("");

  const handleGenerate = () => {
    if (teamSize < 2) {
      setError("Team size must be at least 2.");
      return;
    }

    if (teamSize > participants.length) {
      setError(
        `Please choose a team size of ${participants.length} or less.`
      );
      return;
    }

    setError("");

    onGenerate({
      team_size: teamSize,
      participants: participants,
    });
  };

  return (
    <div className="config-page">
      <div className="config-container">

        <button className="back-button" onClick={onBack}>
          ← Back to Participants
        </button>

        <p className="page-label">STEP 2</p>

        <h1>Configure Your Teams</h1>

        <p className="config-description">
          Choose how many participants should be in each team.
        </p>

        <div className="config-card">

          <div className="participant-count">
            <div>
              <span>Total Participants</span>
              <strong>{participants.length}</strong>
            </div>

            <div className="count-icon">
              👥
            </div>
          </div>

          <div className="config-divider"></div>

          <div className="team-size-section">

            <label htmlFor="teamSize">
              Team Size
            </label>

            <input
              id="teamSize"
              type="number"
              min="2"
              max={participants.length}
              value={teamSize}
              onChange={(event) =>
                setTeamSize(Number(event.target.value))
              }
            />

            <p>
              Each team will contain approximately {teamSize} members.
            </p>
          </div>

          {error && (
            <div className="config-error">
              {error}
            </div>
          )}

          <button
            className="generate-button"
            onClick={handleGenerate}
          >
            Generate Teams →
          </button>

        </div>
      </div>
    </div>
  );
}

export default TeamConfig;