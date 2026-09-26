function ParticipantCard({ participant, onRemove }) {
  return (
    <div className="participant-card">
      <div className="participant-top">
        <div className="participant-avatar">
          {participant.name.charAt(0).toUpperCase()}
        </div>

        <div className="participant-info">
          <h3>{participant.name}</h3>
          <p>{participant.preferred_role}</p>
        </div>

        <button
          className="remove-button"
          onClick={() => onRemove(participant.id)}
        >
          Remove
        </button>
      </div>

      <div className="participant-details">
        <div>
          <strong>Skills</strong>

          <p>
            {participant.skills.map((skill, index) => (
              <span className="tag" key={index}>
                {skill}
              </span>
            ))}
          </p>
        </div>

        <div>
          <strong>Interests</strong>

          <p>
            {participant.interests.map((interest, index) => (
              <span className="tag" key={index}>
                {interest}
              </span>
            ))}
          </p>
        </div>

        <div>
          <strong>Experience</strong>
          <p>{participant.experience}</p>
        </div>
      </div>
    </div>
  );
}

export default ParticipantCard;