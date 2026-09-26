import { useEffect, useState } from "react";
import ParticipantForm from "../components/ParticipantForm";
import ParticipantCard from "../components/ParticipantCard";
import ErrorMessage from "../components/ErrorMessage";
import { addParticipant, getParticipants, deleteParticipant } from "../services/api";

function Participants({ participants, setParticipants, onContinue }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadParticipants() {
      setLoading(true);
      setError("");

      try {
        const response = await getParticipants();
        if (!ignore) {
          setParticipants(response.participants);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load participants.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadParticipants();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async (participantData) => {
    setError("");

    try {
      await addParticipant(participantData);
      const response = await getParticipants();
      setParticipants(response.participants);
    } catch (err) {
      setError(err.message || "Failed to add participant.");
    }
  };

  const handleRemove = async (id) => {
    setError("");

    try {
      await deleteParticipant(id);
      const response = await getParticipants();
      setParticipants(response.participants);
    } catch (err) {
      setError(err.message || "Failed to delete participant.");
    }
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

      {error && <ErrorMessage message={error} />}

      <div className="participant-layout">
        <ParticipantForm onAdd={handleAdd} />

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

          {loading ? (
            <div className="empty-state">
              <h3>Loading participants...</h3>
            </div>
          ) : participants.length === 0 ? (
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
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}

          {participants.length >= 2 && (
            <button
              className="continue-button"
              onClick={onContinue}
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