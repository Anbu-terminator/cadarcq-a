export type Section = "work" | "funding" | "competition";
export type Role = "owner" | "admin";

export interface AdminUser {
  id: string;
  displayName: string;
  role: Role;
}

export interface PostFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  kind: "image" | "pdf";
}

export interface Post {
  id: string;
  section: Section;
  title: string;
  content: string;
  status: string | null;
  file: PostFile | null;
  createdBy: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  role: Role;
  createdAt: string;
}

export const FUNDING_STATUSES = ["Applied", "Under Review", "Shortlisted", "Approved", "Rejected"] as const;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  // Required by the server's CSRF guard on every state-changing request.
  headers.set("X-Requested-With", "XMLHttpRequest");
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");

  let res: Response;
  try {
    res = await fetch(`/api${path}`, { ...init, headers, credentials: "same-origin" });
  } catch {
    throw new ApiError("Cannot reach the server. Please check your connection.", 0);
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!res.ok) {
    const message =
      data && typeof data === "object" && "message" in data && typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Something went wrong. Please try again.";
    throw new ApiError(message, res.status);
  }
  return data as T;
}

export const api = {
  login: (id: string, password: string) =>
    request<{ user: AdminUser }>("/auth/login", { method: "POST", body: JSON.stringify({ id, password }) }),
  logout: () => request<{ ok: true }>("/auth/logout", { method: "POST" }),
  me: () => request<{ user: AdminUser }>("/auth/me"),

  listPosts: (section: Section) => request<{ posts: Post[] }>(`/posts?section=${section}`),
  createPost: (form: FormData) => request<{ post: Post }>("/posts", { method: "POST", body: form }),
  deletePost: (id: string) => request<{ ok: true }>(`/posts/${id}`, { method: "DELETE" }),

  listChat: () => request<{ messages: ChatMessage[] }>("/chat"),
  sendChat: (text: string) => request<{ message: ChatMessage }>("/chat", { method: "POST", body: JSON.stringify({ text }) }),
};

export const fileUrl = (id: string, download = false) => `/api/files/${id}${download ? "?download=1" : ""}`;
