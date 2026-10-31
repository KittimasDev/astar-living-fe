import { api } from "./api";

export const ReportAPIs = {
  getSummary: async (id: any) => {
    return api.get<any>(`/v1/projects/${id}/reports/summary`);
  },
  getOutstanding: async (id: any) => {
    return api.get<any>(`/v1/projects/${id}/reports/outstanding`);
  },
  getAnnual: async (id: any) => {
    return api.get<any>(`/v1/projects/${id}/reports/annual`);
  },

  getReport: async (id: any, type: any, form: any) => {
    return api.get<any>(`/v1/projects/${id}/reports/payments?type=${type}`, {
      params: form,
    });
  },
  getSummaryExpensesReport: async (form: any) => {
    return api.get<any>(`/v1/summary_expenses`, {
      params: form,
    });
  },
  getSummaryExpensesReportPDF: async (form: any) => {
    return api.get<any>(`/v1/summary_expenses/pdf`, {
      params: form,
      responseType: "blob",
      headers: {
        Accept: "application/pdf",
      },
    });
  },
  getSummaryExpensesReportById: async (resident_id: any, form: any) => {
    return api.get<any>(`/v1/summary_expenses/${resident_id}`, {
      params: form,
    });
  },
  getSummaryExpensesReportPDFById: async (resident_id: number, form: any) => {
    return api.get<any>(`/v1/summary_expenses/${resident_id}/pdf`, {
      params: form,
      responseType: "blob",
      headers: {
        Accept: "application/pdf",
      },
    });
  },
};
