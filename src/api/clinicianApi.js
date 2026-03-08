const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
const API_USER = import.meta.env.VITE_API_USER || "clinician";
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD || "clinician123";
const DEFAULT_DISEASE_TYPE =
  import.meta.env.VITE_API_DISEASE_TYPE || "CU";

function buildAuthHeader() {
  const token = window.btoa(`${API_USER}:${API_PASSWORD}`);
  return `Basic ${token}`;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: buildAuthHeader(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const message = `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getDiseaseType() {
  return DEFAULT_DISEASE_TYPE;
}

export async function getDashboard(
  caseId,
  diseaseType = DEFAULT_DISEASE_TYPE,
  includeExplainability = false
) {
  const encodedCaseId = encodeURIComponent(caseId);
  const encodedDisease = encodeURIComponent(diseaseType);
  return request(
    `/api/v1/dashboard/${encodedCaseId}?diseaseType=${encodedDisease}&includeExplainability=${includeExplainability}`
  );
}

export async function getCases() {
  return request("/api/v1/cases");
}

export async function submitCaseReview(caseId, finalStatus, payload) {
  const encodedCaseId = encodeURIComponent(caseId);
  const encodedStatus = encodeURIComponent(finalStatus);
  return request(`/api/v1/cases/${encodedCaseId}/review/${encodedStatus}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
