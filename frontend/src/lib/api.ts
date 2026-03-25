export type UserRole = "student" | "investor" | "developer" | "founder";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  interests: string[];
  readingStyle: string;
  isPro: boolean;
};

export type Briefing = {
  id: string;
  topic: string;
  mode: string;
  summary: string;
  whyThisMatters: string;
  keyTakeaways: string[];
  followUpQuestions: string[];
  articles: Array<{
    title: string;
    link: string;
    pubDate?: string;
    summary?: string;
  }>;
};

export type Quiz = {
  id: string;
  topic: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    answerIndex: number;
    explanation?: string;
  }>;
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const USER_STORAGE_KEY = "nn_user";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    },
    ...init
  });

  if (!response.ok) {
    const maybeJson = await response.json().catch(() => null);
    const message = maybeJson?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function mapReadingMode(style: string): string {
  if (style === "quick") return "daily60";
  if (style === "deep") return "detailed";
  return "short";
}

export function saveCurrentUser(user: User): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function registerUser(payload: {
  name: string;
  email: string;
  role: UserRole;
  interests: string[];
  readingStyle: string;
}): Promise<User> {
  const data = await request<{ user: User }>("/users/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data.user;
}

export async function updateUser(userId: string, payload: Record<string, unknown>): Promise<User> {
  const data = await request<{ user: User }>(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
  saveCurrentUser(data.user);
  return data.user;
}

export async function getDailyTopics(userId: string): Promise<string[]> {
  const data = await request<{ topics: string[] }>(`/feed/daily?userId=${encodeURIComponent(userId)}`);
  return data.topics || [];
}

export async function getBriefing(userId: string, topic: string, mode: string): Promise<Briefing> {
  return request<Briefing>(
    `/feed/briefing/${encodeURIComponent(topic)}?userId=${encodeURIComponent(userId)}&mode=${encodeURIComponent(mode)}`
  );
}

export async function logFeedInteraction(userId: string, topic: string, type = "topic-read"): Promise<void> {
  await request<{ message: string }>("/feed/interact", {
    method: "POST",
    body: JSON.stringify({ userId, topic, type })
  });
}

export async function generateQuiz(userId: string, topic: string, difficulty: string): Promise<Quiz> {
  const data = await request<Quiz>("/quiz/generate", {
    method: "POST",
    body: JSON.stringify({ userId, topic, difficulty })
  });
  return data;
}

export async function submitQuiz(userId: string, quizId: string, answers: number[]) {
  return request<{ score: number; total: number; spacedRepetitionHint: string }>("/quiz/submit", {
    method: "POST",
    body: JSON.stringify({ userId, quizId, answers })
  });
}

export async function createPaymentOrder(userId: string) {
  return request<{ order: { id: string; provider?: string; amount: number; currency: string } }>("/payments/create-order", {
    method: "POST",
    body: JSON.stringify({ userId, plan: "pro-monthly" })
  });
}

export async function confirmPro(userId: string): Promise<User> {
  const data = await request<{ user: User }>("/payments/confirm-pro", {
    method: "POST",
    body: JSON.stringify({ userId })
  });
  saveCurrentUser(data.user);
  return data.user;
}

export async function assistantChat(userId: string | undefined, messages: Array<{ role: string; content: string }>) {
  return request<{ reply: string }>("/assistant/chat", {
    method: "POST",
    body: JSON.stringify({ userId, messages })
  });
}

export async function synthesizeNarration(userId: string | undefined, text: string) {
  return request<{ audioDataUri: string | null; fallbackText: string }>("/assistant/tts", {
    method: "POST",
    body: JSON.stringify({ userId, text })
  });
}
