import { useState, useMemo } from "react";

const TEMPLATES = [
  {
    id: "ai_fullstack",
    title: "🚀 Full-Stack AI Product",
    desc: "Agentic AI web application with intelligent backend orchestration and responsive interface.",
    teamSize: 4,
    requiredSkills: ["Python", "React", "Docker", "Machine Learning"],
    preferredRoles: ["AI/ML Engineer", "Frontend Developer", "Backend Developer", "UI/UX Designer"],
  },
  {
    id: "healthtech",
    title: "🩺 HealthTech Portal",
    desc: "Patient care monitoring platform emphasizing secure backend APIs and intuitive UX.",
    teamSize: 3,
    requiredSkills: ["Python", "React", "SQL", "Figma"],
    preferredRoles: ["Frontend Developer", "Backend Developer", "UI/UX Designer"],
  },
  {
    id: "data_analytics",
    title: "📊 Data Analytics Engine",
    desc: "High-throughput data intelligence pipeline with predictive models and visualization dashboards.",
    teamSize: 3,
    requiredSkills: ["Python", "SQL", "Statistics"],
    preferredRoles: ["Data Analyst", "Database Engineer", "Backend Developer"],
  },
];

const AVAILABLE_ROLE_OPTIONS = [
  "AI/ML Engineer",
  "Frontend Developer",
  "Backend Developer",
  "UI/UX Designer",
  "Data Analyst",
  "DevOps Engineer",
  "Database Engineer",
  "Mobile Developer",
  "Cybersecurity Engineer",
  "Project Manager",
  "Researcher",
  "Presenter",
];

function ProjectSetup({
  participants,
  projectRequirements,
  setProjectRequirements,
  onGenerate,
  onBack,
}) {
  const [projectName, setProjectName] = useState(
    projectRequirements?.project_name || "Autonomous AI Workspace"
  );
  const [projectDescription, setProjectDescription] = useState(
    projectRequirements?.project_description ||
      "Multi-agent autonomous workspace for distributed engineering teams with real-time sync."
  );
  const [teamSize, setTeamSize] = useState(projectRequirements?.team_size || 3);
  const [requiredSkills, setRequiredSkills] = useState(
    projectRequirements?.required_skills || ["Python", "React", "SQL"]
  );
  const [preferredRoles, setPreferredRoles] = useState(
    projectRequirements?.preferred_roles || [
      "AI/ML Engineer",
      "Frontend Developer",
      "Backend Developer",
    ]
  );
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [error, setError] = useState("");

  // Roster inventory for live feasibility
  const rosterSkills = useMemo(() => {
    const map = new Map();
    participants.forEach((p) => {
      (p.skills || []).forEach((s) => {
        const key = s.trim().toLowerCase();
        map.set(key, (map.get(key) || 0) + 1);
      });
    });
    return map;
  }, [participants]);

  const rosterRoles = useMemo(() => {
    const set = new Set();
    participants.forEach((p) => {
      if (p.preferred_role) set.add(p.preferred_role.toLowerCase());
    });
    return set;
  }, [participants]);

  // Projected teams count
  const projectedTeamCount = Math.max(
    1,
    Math.round(participants.length / (teamSize || 3))
  );

  // Apply a template
  const handleApplyTemplate = (tmpl) => {
    setProjectName(tmpl.title.replace(/^[^\s]+\s/, ""));
    setProjectDescription(tmpl.desc);
    setTeamSize(Math.min(tmpl.teamSize, participants.length));
    setRequiredSkills([...tmpl.requiredSkills]);
    setPreferredRoles([...tmpl.preferredRoles]);
    setError("");
  };

  const handleToggleSkill = (skill) => {
    if (requiredSkills.includes(skill)) {
      setRequiredSkills(requiredSkills.filter((s) => s !== skill));
    } else {
      setRequiredSkills([...requiredSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !requiredSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setRequiredSkills([...requiredSkills, trimmed]);
      setCustomSkillInput("");
    }
  };

  const handleToggleRole = (role) => {
    if (preferredRoles.includes(role)) {
      setPreferredRoles(preferredRoles.filter((r) => r !== role));
    } else {
      setPreferredRoles([...preferredRoles, role]);
    }
  };

  const handleRunMatching = () => {
    if (!projectName.trim()) {
      setError("Please specify a project name.");
      return;
    }

    if (teamSize < 2) {
      setError("Team size must be at least 2.");
      return;
    }

    if (teamSize > participants.length) {
      setError(
        `Team size (${teamSize}) cannot exceed total participants (${participants.length}).`
      );
      return;
    }

    const requirements = {
      project_name: projectName.trim(),
      project_description: projectDescription.trim(),
      team_size: teamSize,
      required_skills: requiredSkills,
      preferred_roles: preferredRoles,
    };

    setProjectRequirements(requirements);

    onGenerate({
      team_size: teamSize,
      participants: participants,
      project_requirements: requirements,
    });
  };

  // Pre-match feasibility score calculation
  const skillCoverageMatches = requiredSkills.filter((s) =>
    rosterSkills.has(s.toLowerCase())
  );
  const skillMatchPct =
    requiredSkills.length > 0
      ? Math.round((skillCoverageMatches.length / requiredSkills.length) * 100)
      : 100;

  const roleCoverageMatches = preferredRoles.filter((r) =>
    rosterRoles.has(r.toLowerCase())
  );
  const roleMatchPct =
    preferredRoles.length > 0
      ? Math.round((roleCoverageMatches.length / preferredRoles.length) * 100)
      : 100;

  return (
    <div className="project-setup-page">
      <div className="page-intro-header">
        <div className="intro-meta">
          <span className="step-badge">STEP 2 OF 3</span>
          <h1>Project Requirements & Team Target</h1>
          <p>
            Configure your hackathon project goals, desired squad sizes, and core
            skill criteria to guide AI formation and derived intelligence.
          </p>
        </div>

        <div className="header-meta-badge">
          <span>Roster Pool:</span>
          <strong>{participants.length} Active Participants</strong>
        </div>
      </div>

      {error && <div className="config-error-banner">{error}</div>}

      {/* Preset Templates */}
      <div className="preset-templates-row">
        <div className="templates-label">
          <span>⚡ Fast-track with track template:</span>
        </div>
        <div className="templates-grid">
          {TEMPLATES.map((tmpl) => (
            <button
              type="button"
              key={tmpl.id}
              className="template-card-btn"
              onClick={() => handleApplyTemplate(tmpl)}
            >
              <div className="tmpl-title">{tmpl.title}</div>
              <div className="tmpl-desc">{tmpl.desc}</div>
              <div className="tmpl-meta">
                <span>Target: {tmpl.teamSize}/team</span> •{" "}
                <span>{tmpl.requiredSkills.slice(0, 2).join(", ")}...</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="setup-main-grid">
        {/* Left Form: Project Scope & Size */}
        <div className="setup-card">
          <div className="setup-card-header">
            <h3>1. Project Scope & Sizing</h3>
            <p>Define the hackathon project brief and squad parameters</p>
          </div>

          <div className="form-group">
            <label>Project Title / Hackathon Track</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Autonomous AI Workspace"
            />
          </div>

          <div className="form-group">
            <label>Project Brief & Mission</label>
            <textarea
              rows={3}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Describe the solution architecture and goals..."
            />
          </div>

          <div className="form-group">
            <div className="label-with-badge">
              <label>Target Team Size</label>
              <span className="hint-pill">
                Creates ~{projectedTeamCount} Teams
              </span>
            </div>

            <div className="team-size-stepper">
              <input
                type="number"
                min="2"
                max={participants.length}
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
              />
              <div className="stepper-helper-text">
                Distributes {participants.length} participants across balanced
                squads of ~{teamSize} members.
              </div>
            </div>
          </div>
        </div>

        {/* Right Form: Skills & Roles Guidance */}
        <div className="setup-card">
          <div className="setup-card-header">
            <h3>2. Required Skills & Preferred Roles</h3>
            <p>Key technical proficiencies and functional disciplines needed</p>
          </div>

          <div className="form-group">
            <label>Required Core Skills</label>
            <div className="interactive-tags-container">
              {[
                "Python",
                "React",
                "Node.js",
                "Docker",
                "PyTorch",
                "Figma",
                "SQL",
                "AWS",
                "FastAPI",
                "Statistics",
              ].map((skill) => {
                const isSelected = requiredSkills.includes(skill);
                const countInRoster = rosterSkills.get(skill.toLowerCase()) || 0;
                return (
                  <button
                    type="button"
                    key={skill}
                    className={`tag-toggle-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => handleToggleSkill(skill)}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {skill}
                    {countInRoster > 0 && (
                      <span className="tag-roster-count">{countInRoster}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleAddCustomSkill} className="custom-tag-form">
              <input
                type="text"
                placeholder="Add custom skill requirement..."
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
              />
              <button type="submit" className="custom-tag-add-btn">
                Add
              </button>
            </form>
          </div>

          <div className="form-group">
            <label>Preferred Roles for this Project</label>
            <div className="interactive-tags-container">
              {AVAILABLE_ROLE_OPTIONS.slice(0, 8).map((role) => {
                const isSelected = preferredRoles.includes(role);
                return (
                  <button
                    type="button"
                    key={role}
                    className={`tag-toggle-btn role-tag ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => handleToggleRole(role)}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {role}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Match Feasibility Check Banner */}
      <div className="feasibility-banner">
        <div className="feasibility-metrics">
          <div className="feasibility-item">
            <span className="feas-label">Skill Pool Alignment</span>
            <div className="feas-bar-wrapper">
              <div className="feas-bar-track">
                <div
                  className="feas-bar-fill"
                  style={{ width: `${skillMatchPct}%` }}
                />
              </div>
              <strong>{skillMatchPct}%</strong>
            </div>
            <small>
              {skillCoverageMatches.length} of {requiredSkills.length} required
              skills available in roster
            </small>
          </div>

          <div className="feasibility-item">
            <span className="feas-label">Role Breadth Alignment</span>
            <div className="feas-bar-wrapper">
              <div className="feas-bar-track">
                <div
                  className="feas-bar-fill"
                  style={{ width: `${roleMatchPct}%` }}
                />
              </div>
              <strong>{roleMatchPct}%</strong>
            </div>
            <small>
              {roleCoverageMatches.length} of {preferredRoles.length} preferred
              roles available in roster
            </small>
          </div>
        </div>

        <div className="feasibility-cta">
          <button
            type="button"
            className="back-step-btn"
            onClick={onBack}
          >
            ← Modify Roster
          </button>
          <button
            type="button"
            className="action-btn primary-btn large-cta"
            onClick={handleRunMatching}
          >
            ⚡ Run AI Team Formation →
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectSetup;
