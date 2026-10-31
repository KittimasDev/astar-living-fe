import { api, apiWithoutAuth } from "./api";

export const AuthAPIs = {
  getMe: async () => {
    return api.get<any>(`/v1/auth/me`);
  },
  // login: async (form: any) => {

  //   return api.post<any>(`/v1/auth/login`, form);
  // },
  login: (data: { username: string; password: string }) =>
    apiWithoutAuth.post("/v1/auth/login", data), // ✅ ใช้ apiWithoutAuth
  logout: async () => {
    return api.post<any>(`/v1/auth/logout`);
  },
  refreshToken: async () => {
    return api.post<any>(`/v1/auth/refresh-token`);
  },
  changePassword: async (id: any, form: any) => {
    return api.patch<any>(`/v1/auth/change-password/${id}`, form);
  },
  resetPassword: async (id: any) => {
    return api.post<any>(`/v1/auth/reset-password${id}`);
  },
};
