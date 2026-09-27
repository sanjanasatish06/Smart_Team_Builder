const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function extractErrorMessage(response, fallback) {
  try {
    const data = await response.json();
    if (data && data.detail) {
      return typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data.detail);
    }
  } catch {
    // response had no JSON body — fall through to the default message
  }
  return fallback;
}

export async function addParticipant(participant) {
  const response = await fetch(`${API_BASE_URL}/participants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(participant),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Failed to add participant."));
  }

  return response.json();
}

export async function getParticipants() {
  const response = await fetch(`${API_BASE_URL}/participants`);

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Failed to fetch participants."));
  }

  return response.json();
}

export async function deleteParticipant(participantId) {
  const response = await fetch(`${API_BASE_URL}/participants/${participantId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Failed to delete participant."));
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
    throw new Error(await extractErrorMessage(response, "Failed to generate teams."));
  }

  return response.json();
}

export async function seedParticipants(reset = true) {
  const response = await fetch(`${API_BASE_URL}/participants/seed?reset=${reset}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Failed to seed sample participants."));
  }

  return response.json();
}

export async function clearParticipants() {
  const response = await fetch(`${API_BASE_URL}/participants`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Failed to clear participants."));
  }

  return response.json();
}

export async function saveTeams(saveData) {
  const response = await fetch(`${API_BASE_URL}/saved-teams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(saveData),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Failed to save teams."));
  }

  return response.json();
}

export async function getSavedTeams(groupId = null, saveType = null) {
  const params = new URLSearchParams();
  if (groupId) params.append("group_id", groupId);
  if (saveType) params.append("save_type", saveType);
  const qs = params.toString();
  const url = qs ? `${API_BASE_URL}/saved-teams?${qs}` : `${API_BASE_URL}/saved-teams`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Failed to fetch saved teams."));
  }

  return response.json();
}

export async function getSavedTeam(teamId) {
  const response = await fetch(`${API_BASE_URL}/saved-teams/${teamId}`);

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Failed to fetch saved team."));
  }

  return response.json();
}

export async function deleteSavedTeam(teamId) {
  const response = await fetch(`${API_BASE_URL}/saved-teams/${teamId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Failed to delete saved team."));
  }

  return response.json();
}

export async function clearSavedTeams() {
  const response = await fetch(`${API_BASE_URL}/saved-teams`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Failed to clear saved teams."));
  }

  return response.json();
}

