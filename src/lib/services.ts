import api from "./axios";

export const authService = {
  login: (email: string, password: string) =>
    api.post("/login", { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post("/register", { name, email, password }),

  logout: () => api.post("/auth/logout"),

  getProfile: () => api.get("/auth/profile"),
};

export const taskService = {
  getTasks: (params?: {
    status?: string;
    priority?: string;
    deadline?: string;
  }) => api.get("/tasks", { params }),

  getTaskDetail: (id: number) => api.get(`/tasks/${id}`),

  completeTask: (id: number) => api.put(`/tasks/${id}/complete`),

  createTask: (data: {
    title: string;
    status: string;
    description: string;
    priority: string;
    deadline: string;
  }) => api.post("/tasks", {
    title: data.title,
    status: data.status,
    description: data.description,
    priority: data.priority,
    deadline_date: data.deadline,
  }),

  updateTask: (
    id: number,
    data: {
      title?: string;
      status?: string;
      priority?: string;
      deadline?: string;
    }
  ) => api.put(`/tasks/${id}`, data),

  deleteTask: (id: number) => api.delete(`/tasks/${id}`),
};
