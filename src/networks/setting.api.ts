import { api } from "./api";

export const SettingsAPIs = {
  getAll: async (form: any) => {
    return api.get<any>("/v1/settings", { params: form });
  },
  getOneProjectSettings: async (id: any, form: any) => {
    return api.get<any>(`/v1/projects/${id}/settings`, { params: form });
  },
  getOne: async (id: any) => {
    return api.get<any>(`/v1/settings/${id}`);
  },
  create: async (form: any) => {
    return api.post<any>(`/v1/settings`, form);
  },
  createProjectSettings: async (id: any, form: any) => {
    return api.post<any>(`/v1/projects/${id}/settings`, form);
  },
  update: async (id: any, form: any) => {
    return api.patch<any>(`/v1/settings/${id}`, form);
  },
  updateProjectSettings: async (id: any, form: any) => {
    return api.patch<any>(`/v1/projects/${id}/settings`, form);
  },
  delete: async (id: any) => {
    return api.delete<any>(`/v1/settings/${id}`);
  },
};
