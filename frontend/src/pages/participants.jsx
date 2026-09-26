import { useState } from "react";
import ParticipantForm from "../components/ParticipantForm";
import ParticipantCard from "../components/ParticipantCard";

function Participants({ onContinue }) {
  const [participants, setParticipants] = useState([]);

  const addParticipant = (participant) => {
    setParticipants((current) => [
      ...current,
      {
        ...participant,
        id: Date.now(),
      },
    ]);
  };

  const removeParticipant = (id) => {
    setParticipants((current) =>
      current.filter((participant) => participant.id !== id)
    );
  };

  return (
    <div className="participants-page">
      <div className="page-header">
        <p className="page-label">STEP 1</p>

        <h1>Add Participants</h1>

        <p>
          Add the people who will be part of your hackathon or project team.
        </p>
      </div>

      <div className="participant-layout">
        <ParticipantForm onAdd={addParticipant} />

        <div className="participant-list-section">
          <div className="section-heading">
            <div>
              <h2>Participants</h2>
              <p>
                {participants.length} participant
                {participants.length !== 1 ? "s" : ""} added
              </p>
            </div>
          </div>

          {participants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">+</div>
              <h3>No participants yet</h3>
              <p>
                Add your first participant using the form.
              </p>
            </div>
          ) : (
            <div className="participant-list">
              {participants.map((participant) => (
                <ParticipantCard
                  key={participant.id}
                  participant={participant}
                  onRemove={removeParticipant}
                />
              ))}
            </div>
          )}

          {participants.length >= 2 && (
            <button
              className="continue-button"
              onClick={() => onContinue(participants)}
            >
              Continue to Team Setup →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Participants;