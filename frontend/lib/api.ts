import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_URL });

/* ── Auto-attach JWT token ── */
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("ln_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ── Auto-handle 401 ── */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("ln_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

/* ── Auth API ── */
export const authAPI = {
  login:    (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (name: string, email: string, password: string, role: string) =>
    api.post("/auth/register", { name, email, password, role }),
  me:       () => api.get("/auth/me"),
};

/* ── Lost Items ── */
export const lostAPI = {
  list:   (params?: Record<string, string>) => api.get("/lost-items", { params }),
  get:    (id: number) => api.get(`/lost-items/${id}`),
  create: (data: FormData | object) => api.post("/lost-items", data),
  update: (id: number, data: object) => api.put(`/lost-items/${id}`, data),
  delete: (id: number) => api.delete(`/lost-items/${id}`),
};

/* ── Found Items ── */
export const foundAPI = {
  list:   (params?: Record<string, string>) => api.get("/found-items", { params }),
  get:    (id: number) => api.get(`/found-items/${id}`),
  create: (data: FormData | object) => api.post("/found-items", data),
  update: (id: number, data: object) => api.put(`/found-items/${id}`, data),
  delete: (id: number) => api.delete(`/found-items/${id}`),
};

/* ── Matches ── */
export const matchAPI = {
  list:    () => api.get("/matches"),
  listAll: () => api.get("/matches/all"),
  confirm: (id: number) => api.post(`/matches/${id}/confirm`),
  reject:  (id: number) => api.post(`/matches/${id}/reject`),
  run:     () => api.post("/matches/run"),
};

/* ── Claims ── */
export const claimAPI = {
  list:   () => api.get("/claims"),
  submit: (match_id: number, message: string) => api.post("/claims", { match_id, message }),
  update: (id: number, status: string) => api.put(`/claims/${id}`, { status }),
};

/* ── Notifications ── */
export const notifAPI = {
  list:        () => api.get("/notifications"),
  unreadCount: () => api.get("/notifications/unread-count"),
  markRead:    (id: number) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/mark-all-read"),
};

/* ── Admin ── */
export const adminAPI = {
  stats:     () => api.get("/admin/stats"),
  users:     () => api.get("/admin/users"),
  activity:  () => api.get("/admin/activity"),
  updateRole:(id: number, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser:(id: number) => api.delete(`/admin/users/${id}`),
  runMatch:  () => api.post("/admin/match/run"),
};

export default api;
