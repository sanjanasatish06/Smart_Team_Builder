import { useState } from "react";

const POPULAR_SKILLS = [
  "Python",
  "React",
  "Node.js",
  "PyTorch",
  "Docker",
  "Figma",
  "SQL",
  "AWS",
  "FastAPI",
  "UI/UX",
  "TypeScript",
  "Machine Learning",
];

const POPULAR_INTERESTS = [
  "AI & Agents",
  "Web Development",
  "HealthTech",
  "FinTech",
  "Cloud & DevOps",
  "Design & UX",
  "Startups",
];

const ROLES = [
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

function ParticipantForm({ onAdd, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    name: "",
    skills: "",
    interests: "",
    experience: "Intermediate",
    preferred_role: "Frontend Developer",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkillChip = (skill) => {
    const existing = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!existing.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        skills: existing.length > 0 ? `${existing.join(", ")}, ${skill}` : skill,
      }));
    }
  };

  const handleAddInterestChip = (interest) => {
    const existing = formData.interests
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!existing.some((s) => s.toLowerCase() === interest.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        interests: existing.length > 0 ? `${existing.join(", ")}, ${interest}` : interest,
      }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Please enter the participant's name.");
      return;
    }

    const skillsList = formData.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (skillsList.length === 0) {
      setError("Please enter at least one skill or select from suggestions.");
      return;
    }

    const interestsList = formData.interests
      .split(",")
      .map((interest) => interest.trim())
      .filter(Boolean);

    if (interestsList.length === 0) {
      setError("Please enter at least one interest or select from suggestions.");
      return;
    }

    if (!formData.experience) {
      setError("Please select an experience level.");
      return;
    }

    if (!formData.preferred_role) {
      setError("Please select a preferred role.");
      return;
    }

    const participant = {
      name: formData.name.trim(),
      skills: skillsList,
      interests: interestsList,
      experience: formData.experience,
      preferred_role: formData.preferred_role,
    };

    onAdd(participant);

    setFormData({
      name: "",
      skills: "",
      interests: "",
      experience: "Intermediate",
      preferred_role: "Frontend Developer",
    });

    setError("");
  };

  return (
    <form className="participant-form-card" onSubmit={handleSubmit}>
      <div className="form-card-header">
        <div>
          <h3>Add Participant Profile</h3>
          <p>Register participant skills, seniority, and preferred role</p>
        </div>
      </div>

      <div className="form-group">
        <label>Full Name</label>
        <input
          type="text"
          name="name"
          placeholder="e.g. Shravya Rao"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Preferred Role</label>
        <select
          name="preferred_role"
          value={formData.preferred_role}
          onChange={handleChange}
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Experience Seniority</label>
        <div className="experience-selector">
          {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
            <button
              type="button"
              key={lvl}
              className={`exp-pill-btn ${
                formData.experience === lvl ? "selected " + lvl.toLowerCase() : ""
              }`}
              onClick={() => setFormData((prev) => ({ ...prev, experience: lvl }))}
            >
              <span className="exp-dot" />
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Key Skills</label>
        <input
          type="text"
          name="skills"
          placeholder="e.g. Python, React, PyTorch"
          value={formData.skills}
          onChange={handleChange}
        />
        <div className="quick-chips-container">
          <span className="quick-chips-label">Quick add:</span>
          {POPULAR_SKILLS.slice(0, 7).map((s) => (
            <button
              type="button"
              key={s}
              className="quick-chip-btn"
              onClick={() => handleAddSkillChip(s)}
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Domains & Interests</label>
        <input
          type="text"
          name="interests"
          placeholder="e.g. AI & Agents, HealthTech"
          value={formData.interests}
          onChange={handleChange}
        />
        <div className="quick-chips-container">
          <span className="quick-chips-label">Quick add:</span>
          {POPULAR_INTERESTS.slice(0, 5).map((interest) => (
            <button
              type="button"
              key={interest}
              className="quick-chip-btn"
              onClick={() => handleAddInterestChip(interest)}
            >
              + {interest}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="form-error-banner">{error}</p>}

      <button
        type="submit"
        className="add-participant-btn"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Adding..." : "+ Add to Roster"}
      </button>
    </form>
  );
}

export default ParticipantForm;