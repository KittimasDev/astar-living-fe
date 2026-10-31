import { api } from "./api";

export const UserAPIs = {
  getAll: async (form: any) => {
    return api.get<any>("/v1/user", {
      params: form,
    });
  },
  getOne: async (id: any) => {
    return api.get<any>(`/v1/user/${id}`);
  },
  create: async (form: any) => {
    return api.post<any>(`/v1/user`, form);
  },
  update: async (id: any, form: any) => {
    return api.patch<any>(`/v1/user/${id}`, form);
  },
  delete: async (id: any) => {
    return api.delete<any>(`/v1/user/${id}`);
  },
};
