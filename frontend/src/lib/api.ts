import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fp_access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("fp_refresh");
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
            refreshToken: refresh,
          });
          localStorage.setItem("fp_access", data.accessToken);
          localStorage.setItem("fp_refresh", data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string; confirmPassword: string; role?: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

// Workspaces
export const workspaceApi = {
  list: () => api.get("/workspaces"),
  create: (data: { name: string; description?: string }) =>
    api.post("/workspaces", data),
  getBySlug: (slug: string) => api.get(`/workspaces/${slug}`),
  update: (id: string, data: { name: string; description?: string }) =>
    api.put(`/workspaces/${id}`, data),
  members: (id: string) => api.get(`/workspaces/${id}/members`),
  invite: (id: string, data: { email: string; role: string }) =>
    api.post(`/workspaces/${id}/members`, data),
  removeMember: (id: string, memberId: string) =>
    api.delete(`/workspaces/${id}/members/${memberId}`),
};

// Projects
export const projectApi = {
  list: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/projects`),
  create: (workspaceId: string, data: object) =>
    api.post(`/workspaces/${workspaceId}/projects`, data),
  get: (workspaceId: string, projectId: string) =>
    api.get(`/workspaces/${workspaceId}/projects/${projectId}`),
  update: (workspaceId: string, projectId: string, data: object) =>
    api.put(`/workspaces/${workspaceId}/projects/${projectId}`, data),
  delete: (workspaceId: string, projectId: string) =>
    api.delete(`/workspaces/${workspaceId}/projects/${projectId}`),
};

// Tasks
export const taskApi = {
  list: (workspaceId: string, projectId: string, params?: object) =>
    api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks`, { params }),
  create: (workspaceId: string, projectId: string, data: object) =>
    api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks`, data),
  update: (workspaceId: string, projectId: string, taskId: string, data: object) =>
    api.put(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, data),
  move: (workspaceId: string, projectId: string, taskId: string, data: object) =>
    api.patch(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/move`, data),
  delete: (workspaceId: string, projectId: string, taskId: string) =>
    api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`),
};

// Dashboard
export const dashboardApi = {
  stats: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/dashboard`),
};
