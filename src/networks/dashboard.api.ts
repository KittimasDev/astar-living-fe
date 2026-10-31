import { api } from "./api";

export const DashboardAPIs = {
  getAll: async (form: any) => {
    return api.get<any>(`/v1/dashboard`, { params: form });
  },
};
