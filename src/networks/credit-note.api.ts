import { api } from "./api";

export const CreditNoteAPIs = {
  getAll: async (form: any) => {
    return api.get<any>(`/v1/reduce`, { params: form });
  },

  getReduceList: async (form: any) => {
    return api.get<any>(`/v1/reduce`, { params: form });
  },

  getOne: async (id: any) => {
    return api.get<any>(`/v1/reduce/${id}`);
  },

  check: async (id: any) => {
    return api.get<any>(`/v1/reduce-check/${id}`);
  },

  confirm: async (id: any, form: any) => {
    return api.patch<any>(`/v1/reduce/${id}`, form);
  },

  detail: async (id: any) => {
    return api.get<any>(`/v1/reduce/${id}`);
  },

  create: async (form: any) => {
    return api.post<any>(`/v1/collections`, form);
  },

  update: async (id: any, form: any) => {
    return api.patch<any>(`/v1/collections/${id}`, form);
  },

  delete: async (id: any) => {
    return api.delete<any>(`/v1/collections/${id}`);
  },

  // สร้างใบทวงถาม
  createPdf: async (id: any) => {
    // return api.get<any>(`/v1/receipts/collection/${id}`, {
    return api.get<any>(`/v1/collections/${id}/print`, {
      responseType: "blob",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/pdf",
      },
    });
  },

  createMultiPdf: async (form: any) => {
    return api.post<any>(`/v1/collections/print`, form, {
      responseType: "blob",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/pdf",
      },
    });
  },
};
