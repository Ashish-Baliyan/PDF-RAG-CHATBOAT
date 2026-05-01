const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const CHAT_ENDPOINT = import.meta.env.VITE_CHAT_ENDPOINT || "/chat";

function buildUrl(path) {
  const base = API_BASE_URL.replace(/\/+$/, "");
  const endpoint = path.startsWith("/") ? path : `/${path}`;
  return `${base}${endpoint}`;
}

function normalizeChatResponse(data) {
  if (typeof data === "string") {
    return { answer: data, sources: [] };
  }

  const answer =
    data.answer ||
    data.response ||
    data.message ||
    data.result ||
    "No answer was returned by the backend.";

  const sources = data.sources || data.context || data.documents || data.references || [];

  return { answer, sources: Array.isArray(sources) ? sources : [] };
}

export async function sendChatMessage(question) {
  let response;

  try {
    response = await fetch(buildUrl(CHAT_ENDPOINT), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question, query: question, message: question })
    });
  } catch (error) {
    throw new Error(
      "Backend API is not reachable. Start FastAPI on port 8000, then try again."
    );
  }

  let payload;
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    payload = await response.json();
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    const detail = payload?.detail || payload?.error || payload || "Request failed.";
    throw new Error(detail);
  }

  return normalizeChatResponse(payload);
}
