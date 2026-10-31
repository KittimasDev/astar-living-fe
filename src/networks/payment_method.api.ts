import { api } from "./api";

export const PaymentMethodAPIs = {
  getAll: async (form: any) => {
    return api.get<any>("/v1/payment_method", {
      params: form,
    });
  },
  getOne: async (id: any) => {
    return api.get<any>(`/v1/payment_method/${id}`);
  },
  create: async (form: any) => {
    return api.post<any>(`/v1/payment_method`, form);
  },
  update: async (id: any, form: any) => {
    return api.patch<any>(`/v1/payment_method/${id}`, form);
  },
  delete: async (id: any) => {
    return api.delete<any>(`/v1/payment_method/${id}`);
  },
};
