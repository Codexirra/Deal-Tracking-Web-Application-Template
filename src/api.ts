import type { DashboardSummary, Deal, DealFiltersState, DealInput, Metadata, TaskPriority } from "./types";

const normalizeApiBase = (value?: string) => { const base = (value || "/api").replace(/\/+$/, ""); return base.endsWith("/api") ? base : `${base}/api`; };

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL);

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      message = body.detail || message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  getDashboard: () => request<DashboardSummary>("/dashboard"),
  getMetadata: () => request<Metadata>("/metadata"),
  getDeals: (filters: DealFiltersState) => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.stage) params.set("stage", filters.stage);
    if (filters.owner) params.set("owner", filters.owner);
    const query = params.toString();
    return request<Deal[]>(`/deals${query ? `?${query}` : ""}`);
  },
  getDeal: (id: number) => request<Deal>(`/deals/${id}`),
  createDeal: (payload: DealInput) => request<Deal>("/deals", { method: "POST", body: JSON.stringify(payload) }),
  updateDeal: (id: number, payload: DealInput) => request<Deal>(`/deals/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  addNote: (dealId: number, body: string, author: string) =>
    request<Deal>(`/deals/${dealId}/notes`, { method: "POST", body: JSON.stringify({ body, author }) }),
  addTask: (dealId: number, title: string, dueDate: string, priority: TaskPriority) =>
    request<Deal>(`/deals/${dealId}/tasks`, { method: "POST", body: JSON.stringify({ title, dueDate, priority }) }),
  completeTask: (taskId: number) => request<Deal>(`/tasks/${taskId}/complete`, { method: "PATCH" })
};
