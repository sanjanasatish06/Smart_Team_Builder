import { useState } from "react";

const roles = [
  "Developer",
  "AI/ML Engineer",
  "UI/UX Designer",
  "Researcher",
  "Presenter",
  "Team Lead",
  "Data Analyst",
  "Backend Developer",
  "Frontend Developer",
];

function ParticipantForm({ onAdd }) {
  const [formData, setFormData] = useState({
    name: "",
    skills: "",
    interests: "",
    experience: "",
    preferred_role: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Please enter the participant's name.");
      return;
    }

    if (!formData.skills.trim()) {
      setError("Please enter at least one skill.");
      return;
    }

    if (!formData.interests.trim()) {
      setError("Please enter at least one interest.");
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

      skills: formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),

      interests: formData.interests
        .split(",")
        .map((interest) => interest.trim())
        .filter(Boolean),

      experience: formData.experience,

      preferred_role: formData.preferred_role,
    };

    onAdd(participant);

    setFormData({
      name: "",
      skills: "",
      interests: "",
      experience: "",
      preferred_role: "",
    });

    setError("");
  };

  return (
    <form className="participant-form" onSubmit={handleSubmit}>
      <h2>Participant Details</h2>

      <div className="form-group">
        <label>Name</label>

        <input
          type="text"
          name="name"
          placeholder="e.g. Shravya"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Skills</label>

        <input
          type="text"
          name="skills"
          placeholder="Python, React, SQL"
          value={formData.skills}
          onChange={handleChange}
        />

        <span>Separate multiple skills with commas.</span>
      </div>

      <div className="form-group">
        <label>Interests</label>

        <input
          type="text"
          name="interests"
          placeholder="AI, Web Development, Healthcare"
          value={formData.interests}
          onChange={handleChange}
        />

        <span>Separate multiple interests with commas.</span>
      </div>

      <div className="form-group">
        <label>Experience</label>

        <select
          name="experience"
          value={formData.experience}
          onChange={handleChange}
        >
          <option value="">Select experience</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      <div className="form-group">
        <label>Preferred Role</label>

        <select
          name="preferred_role"
          value={formData.preferred_role}
          onChange={handleChange}
        >
          <option value="">Select preferred role</option>

          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="add-participant-button">
        + Add Participant
      </button>
    </form>
  );
}

export default ParticipantForm;