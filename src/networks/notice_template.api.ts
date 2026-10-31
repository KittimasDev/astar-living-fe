import { api } from "./api";

export const NoticeTemplateAPIs = {
  getAll: async (form: any) => {
    return api.get<any>("/v1/notice_template", { params: form });
  },

  getOne: async (id: any) => {
    return api.get<any>(`/v1/notice_template/${id}`);
  },

  create: async (form: any) => {
    return api.post<any>(`/v1/notice_template`, form);
  },

  update: async (id: any, form: any) => {
    return api.patch<any>(`/v1/notice_template/${id}`, form);
  },

  delete: async (id: any) => {
    return api.delete<any>(`/v1/notice_template/${id}`);
  },
};
