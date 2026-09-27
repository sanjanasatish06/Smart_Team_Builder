import { useEffect, useState } from "react";

const STAGES = [
  "Normalizing participant skills, experience levels, and interest vectors...",
  "Computing 5-dimensional synergy matrices (Skill, Role, Seniority, Interests, Preferences)...",
  "Executing hill-climbing combinatorial swaps to maximize configuration balance...",
  "Applying intelligent role matching to satisfy candidate preferences...",
  "Synthesizing explainable AI reasoning and team readiness indices...",
];

function LoadingState() {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 450);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 8 : prev));
    }, 150);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="matching-loading-overlay">
      <div className="matching-loading-card">
        <div className="matching-spinner-glow">
          <div className="inner-pulse-dot" />
        </div>

        <div className="matching-badge">
          <span>AI SYNERGY ENGINE</span>
        </div>

        <h2>Synthesizing Optimal Teams</h2>

        <p className="stage-description">{STAGES[currentStage]}</p>

        <div className="matching-progress-track">
          <div
            className="matching-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="matching-steps-list">
          {STAGES.map((stage, idx) => (
            <div
              key={idx}
              className={`matching-step-item ${
                idx < currentStage
                  ? "done"
                  : idx === currentStage
                  ? "active"
                  : "pending"
              }`}
            >
              <div className="step-state-dot">
                {idx < currentStage ? "✓" : idx + 1}
              </div>
              <span>{stage.split("...")[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LoadingState;