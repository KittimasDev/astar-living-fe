import { getPairTokens, setPairTokens } from "../libs/token";
import { api } from "./api";
import { User } from "./models/user.model";

export const authAPIs = {
  checkToken: () => {
    const { refreshToken } = getPairTokens();
    if (refreshToken) {
      return true;
    } else {
      return false;
    }
  },
  login: async (form: { username: string; password: string }) => {
    const response = await api.post<{
      access_token: string;
      refresh_token: string;
    }>(`/v1/guest/login`, form);

    if (response.data) {
      setPairTokens(response.data.access_token, response.data.refresh_token);
    }
    return response.data;
  },
  loginKeyCloak: async (form: {
    username: string;
    password: string;
    access_token: string | string[];
  }) => {
    const response = await api.post<{
      access_token: string;
      refresh_token: string;
    }>(`/v1/guest/login`, form);

    if (response.data) {
      setPairTokens(response.data.access_token, response.data.refresh_token);
    }
    return response.data;
  },
  forgotPassword: async (form: { username: string }) => {
    const response = await api.post(`/v1/guest/forgot-password`, form);
    return response.data;
  },
  resetPassword: async (form: { password: string }) => {
    const response = await api.post<{
      access_token: string;
      refresh_token: string;
    }>(`/v1/reset-password`, form);

    if (response.data) {
      setPairTokens(response.data.access_token, response.data.refresh_token);
    }
    return response.data;
  },

  resetForgotPassword: async (token: any, form: { password: string }) => {
    const response = await api.post<{
      access_token: string;
      refresh_token: string;
    }>(`/v1/guest/reset-password/${token}`, form);

    return response.data;
  },
  logout: async () => {
    await api.post(`/v1/logout`);
  },
  refreshToken: async () => {
    const { refreshToken } = getPairTokens();

    const response = await api.post<{
      access_token: string;
      refresh_token: string;
    }>(`/v1/guest/refresh_token`, { refresh_token: refreshToken });

    if (response.data) {
      setPairTokens(response.data.access_token, response.data.refresh_token);
    }
    return response.data;
  },
  getMe: async () => {
    return api.get<User>("/v1/me");
  },
};
