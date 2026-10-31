import { api } from "./api";

export const PaymentAPIs = {
  getAll: async (form: any) => {
    return api.get<any>("/v1/payments", { params: form });
  },
  // แสดงรายการชำระค่าส่วนกลางทั้งหมดในโครงการ
  getAllPaymentByProject: async (id: any, form: any) => {
    return api.get<any>(`/v1/projects/${id}/payments`, { params: form });
  },
  // ดึงรายการบ้านที่ค้างชำระ
  getOutstanding: async (id: any) => {
    return api.get<any>(`/v1/payments/outstanding`);
  },
  // ดึงรายการทวงถามของบ้านที่ค้างชำระ
  getReminder: async (id: any, form: any) => {
    return api.get<any>(`/v1/projects/${id}/payments/reminders`, {
      params: form,
    });
  },
  // ดึงรายการออกใบแจ้งหนี้ของเดือนก่อนหน้า
  getPaymentInvoice: async (id: any, form: any, params: any) => {
    return api.post<any>(`/v1/projects/${id}/payments/invoices`, form, {
      params: params,
    });
  },
  createInvoice: async (id: any, form: any) => {
    return api.post<any>(`/v1/projects/${id}/payments/invoices/create`, form);
  },
  getMonthRange: async (id: any) => {
    return api.get<any>(`/v1/projects/${id}/payments/month-range`);
  },

  getPaidResident: async (id: any, form: any) => {
    return api.get<any>(`/v1/projects/${id}/payments/residents`, {
      params: form,
    });
  },
  getYearPaidResident: async (id: any, form: any) => {
    return api.post<any>(
      `/v1/projects/${id}/payments/advance-invoices/year`,
      form
    );
  },
  getMonthPaidResident: async (id: any, form: any) => {
    return api.post<any>(
      `/v1/projects/${id}/payments/advance-invoices/months`,
      form
    );
  },
  previewInvoice: async (id: any, form: any) => {
    return api.post<any>(
      `/v1/projects/${id}/payments/advance-invoices/preview`,
      form
    );
  },
  confirmInvoice: async (id: any, form: any) => {
    return api.post<any>(`/v1/projects/${id}/payments/advance-invoices`, form);
  },
  createPdf: async (id: any, form: any) => {
    return api.post<any>(
      `/v1/projects/${id}/payments/advance-invoices/pdf`,
      form,
      {
        responseType: "blob",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/pdf",
        },
      }
    );
  },
  createPaymentPdf: async (id: any, payment_id: any, form: any) => {
    return api.post<any>(
      `/v1/projects/${id}/payments/invoices/pdf/${payment_id}`,
      form,
      {
        responseType: "blob",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/pdf",
        },
      }
    );
  },

  //

  getOne: async (id: any) => {
    return api.get<any>(`/v1/payments/${id}`);
  },
  createProjectSettings: async (id: any, form: any) => {
    return api.post<any>(`/v1/projects/${id}/payments`, form);
  },
  update: async (id: any, form: any) => {
    return api.patch<any>(`/v1/payments/${id}`, form);
  },
  updateProjectSettings: async (id: any, form: any) => {
    return api.patch<any>(`/v1/projects/${id}/payments`, form);
  },
  delete: async (id: any) => {
    return api.delete<any>(`/v1/payments/${id}`);
  },
  downloadPdf: async (id: any, form: any) => {
    return api.post(`/v1/projects/${id}/payments/invoices/pdf`, form, {
      responseType: "blob",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/pdf",
      },
    });
  },
};
