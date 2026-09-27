const STEPS = [
  { id: "participants", label: "1. Participants", desc: "Build Roster" },
  { id: "project", label: "2. Project Setup", desc: "Skills & Goals" },
  { id: "results", label: "3. Results & Intelligence", desc: "Synergy & Analytics" },
];

function WorkflowHeader({ currentStep, onNavigate, participantCount = 0 }) {
  const getStepIndex = (step) => {
    if (step === "participants") return 0;
    if (step === "project" || step === "config") return 1;
    if (step === "results" || step === "intelligence") return 2;
    return -1;
  };

  const activeIdx = getStepIndex(currentStep);

  return (
    <header className="workflow-navbar">
      <div className="workflow-brand" onClick={() => onNavigate("home")}>
        <div className="brand-icon">⚡</div>
        <div>
          <div className="brand-title">Smart Team Builder</div>
          <div className="brand-subtitle">AI Team Formation Engine</div>
        </div>
      </div>

      <nav className="workflow-stepper">
        {STEPS.map((step, idx) => {
          const isCurrent = idx === activeIdx;
          const isCompleted = idx < activeIdx;
          const isClickable =
            idx < activeIdx ||
            (idx === 1 && participantCount >= 2);

          return (
            <div
              key={step.id}
              className={`stepper-item ${isCurrent ? "active" : ""} ${
                isCompleted ? "completed" : ""
              } ${isClickable ? "clickable" : "disabled"}`}
              onClick={() => {
                if (isClickable) onNavigate(step.id);
              }}
            >
              <div className="stepper-circle">
                {isCompleted ? "✓" : idx + 1}
              </div>
              <div className="stepper-meta">
                <span className="stepper-label">{step.label}</span>
                <span className="stepper-desc">{step.desc}</span>
              </div>
              {idx < STEPS.length - 1 && <div className="stepper-line" />}
            </div>
          );
        })}
      </nav>

      <div className="workflow-actions">
        <button
          className="header-ghost-btn"
          onClick={() => onNavigate("home")}
          title="Return to Landing Page"
        >
          Overview
        </button>
      </div>
    </header>
  );
}

export default WorkflowHeader;
