function getRoleColor(role = "") {
  const r = role.toLowerCase();
  if (r.includes("ai") || r.includes("ml")) return "#9b51e0";
  if (r.includes("front") || r.includes("ui") || r.includes("ux")) return "#397bea";
  if (r.includes("back") || r.includes("data") || r.includes("sql")) return "#00b4d8";
  if (r.includes("devops") || r.includes("cloud") || r.includes("sec")) return "#f77f00";
  return "#2ec4b6";
}

function ParticipantCard({ participant, onRemove }) {
  const roleColor = getRoleColor(participant.preferred_role);
  const expLower = (participant.experience || "").toLowerCase();

  return (
    <div className="participant-card-item">
      <div className="card-top-row">
        <div
          className="participant-avatar-badge"
          style={{ background: `linear-gradient(135deg, ${roleColor}, #1d3557)` }}
        >
          {participant.name.charAt(0).toUpperCase()}
        </div>

        <div className="participant-meta-block">
          <div className="participant-name-title">
            <h4>{participant.name}</h4>
            <span
              className={`seniority-tag ${expLower}`}
              title={`Seniority: ${participant.experience}`}
            >
              {participant.experience}
            </span>
          </div>
          <div className="participant-role-pill">
            <span className="role-dot" style={{ backgroundColor: roleColor }} />
            {participant.preferred_role}
          </div>
        </div>

        <button
          className="card-remove-btn"
          onClick={() => onRemove(participant.id)}
          title="Remove from roster"
        >
          ✕
        </button>
      </div>

      <div className="card-details-grid">
        <div className="tag-group">
          <span className="tag-group-label">Skills</span>
          <div className="tags-flex">
            {(participant.skills || []).map((skill, index) => (
              <span className="skill-pill" key={index}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="tag-group">
          <span className="tag-group-label">Interests</span>
          <div className="tags-flex">
            {(participant.interests || []).map((interest, index) => (
              <span className="interest-pill" key={index}>
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParticipantCard;