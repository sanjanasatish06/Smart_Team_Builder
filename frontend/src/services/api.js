const API_BASE_URL = "http://localhost:8000";

export async function addParticipant(participant) {
  const response = await fetch(`${API_BASE_URL}/participants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(participant),
  });

  if (!response.ok) {
    throw new Error("Failed to add participant.");
  }

  return response.json();
}

export async function getParticipants() {
  const response = await fetch(`${API_BASE_URL}/participants`);

  if (!response.ok) {
    throw new Error("Failed to fetch participants.");
  }

  return response.json();
}

export async function generateTeams(teamData) {
  const response = await fetch(`${API_BASE_URL}/generate-teams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(teamData),
  });

  if (!response.ok) {
    throw new Error("Failed to generate teams.");
  }

  return response.json();
}