import { api } from "./api";

export const ReceiptAPIs = {
  getAll: async (form: any) => {
    return api.get<any>("/v1/receipts", { params: form });
  },

  // แสดงรายการใบเสร็จทั้งหมดในโครงการ
  getAllReceiptsByProject: async (id: any, form: any) => {
    return api.get<any>(`/v1/projects/${id}/receipts`, { params: form });
  },
  // เลือกลูกบ้าน
  getPaidResident: async (id: any, form: any) => {
    return api.get<any>(`/v1/projects/${id}/receipts/residents`, {
      params: form,
    });
  },
  // เลือกงวดชำระ
  getReceipt: async (id: any, form?: any) => {
    return api.get<any>(`/v1/receipts/residents/${id}`, { params: form });
  },
  // เลือกจำนวนเงินกับวิธีการชำระเงิน
  postReceiptResident: async (id: any, form: any) => {
    return api.post<any>(`/v1/receipts/residents/${id}`, form);
  },
  // ออกใบเสร็จใหม่
  create: async (form: any) => {
    return api.post<any>(`/v1/receipts`, form);
  },
  rejectReceipt: async (id: any, form: any) => {
    return api.patch<any>(`/v1/receipts/rejected/${id}`, form);
  },
  // สร้างใบเสร็จเป็น pdf
  createPdf: async (id: any, form: any) => {
    return api.get<any>(`/v1/receipts/collection/${id}`, form);
  },
  // print ใบเสร็จ
  printPdf: async (id: any) => {
    return api.get<any>(`/v1/receipts/${id}/print`, {
      responseType: "blob",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/pdf",
      },
    });
  },

  // new requirement ออกใบเสร็จรายรับอื่นๆ
  // ออกใบเสร็จรายรับอื่นๆ
  createTransaction: async (form: any) => {
    return api.post<any>(`/transactions`, form);
  },

  // print ใบเสร็จรายรับอื่นๆ
  printTransactionPdf: async (id: any) => {
    return api.get<any>(`/transactions/revenues/${id}/print`, {
      responseType: "blob",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/pdf",
      },
    });
  },

  getAllTransactions: async (id: any, form: any) => {
    return api.get<any>(`/transactions/projects/${id}/revenues`, {
      params: form,
    });
  },

  rejectTransaction: async (id: any, form: any) => {
    return api.patch<any>(`/transactions/rejected/${id}`, form);
  },
};
