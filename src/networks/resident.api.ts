import { api } from "./api";

export const ResidentsAPIs = {
  getAll: async (form: any) => {
    return api.get<any>("/v1/residents", {
      params: form,
    });
  },
  getAllOneProject: async (id: any, form: any) => {
    return api.get<any>(`/v1/projects/${id}/residents`, { params: form });
  },
  getOne: async (id: any) => {
    return api.get<any>(`/v1/residents/${id}`);
  },
  create: async (form: any) => {
    return api.post<any>(`/v1/residents`, form);
  },
  update: async (id: any, form: any) => {
    return api.patch<any>(`/v1/residents/${id}`, form);
  },
  delete: async (id: any) => {
    return api.delete<any>(`/v1/residents/${id}`);
  },
};
