const API_URL = "/api";

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Something went wrong");
    return data;
  },

  auth: {
    login: (credentials: any) => api.request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
    adminLogin: (credentials: any) => api.request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
    signup: (data: any) => api.request("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  },

  profile: {
    get: () => api.request("/profile"),
    update: (data: any) => api.request("/profile", { method: "PUT", body: JSON.stringify(data) }),
    searchStudents: (params: any) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/students/search?${query}`);
    },
  },

  companies: {
    getAll: () => api.request("/companies"),
  },

  jobs: {
    getAll: () => api.request("/jobs"),
    getMy: () => api.request("/jobs/my"),
    create: (data: any) => api.request("/jobs", { method: "POST", body: JSON.stringify(data) }),
  },

  applications: {
    apply: (jobId: string) => api.request("/applications", { method: "POST", body: JSON.stringify({ job_id: jobId }) }),
    getMy: () => api.request("/applications/my"),
    getByJob: (jobId: string) => api.request(`/applications/job/${jobId}`),
    updateStatus: (id: string, status: string) => api.request(`/applications/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  },

  interviews: {
    schedule: (data: { application_id: string, scheduled_at: string }) => api.request("/interviews", { method: "POST", body: JSON.stringify(data) }),
    getMy: () => api.request("/interviews/my"),
    getRoom: (roomId: string) => api.request(`/interviews/${roomId}`),
    evaluate: (id: string, data: { notes: string, rating: number, status: string }) => api.request(`/interviews/${id}/evaluate`, { method: "PUT", body: JSON.stringify(data) }),
  },

  admin: {
    getStats: () => api.request("/admin/stats"),
    getKeys: () => api.request("/admin/keys"),
    generateKey: () => api.request("/admin/keys", { method: "POST" }),
    updateKeyStatus: (id: string, status: string) => api.request(`/admin/keys/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  },

  students: {
    getProfile: (id: string) => api.request(`/students/${id}`),
  },
  notifications: {
    getMy: () => api.request("/notifications/my"),
    markAsRead: (id: string) => api.request(`/notifications/${id}/read`, { method: "PUT" }),
  },
  competitions: {
    getAll: () => api.request("/competitions"),
    create: (data: any) => api.request("/competitions", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) => api.request(`/competitions/${id}`, { method: "DELETE" }),
  },
};
