import { api } from "./api";

export const ProjectAPIs = {
  getAll: async (form: any) => {
    return api.get<any>("/v1/project", { params: form });
  },

  getOne: async (id: any) => {
    return api.get<any>(`/v1/project/${id}`);
  },

  create: async (form: any) => {
    return api.post<any>(`/v1/project`, form);
  },

  update: async (id: any, form: any) => {
    return api.patch<any>(`/v1/project/${id}`, form);
  },

  delete: async (id: any) => {
    return api.delete<any>(`/v1/project/${id}`);
  },

  /**
   * ✅ อัปโหลดรูปโลโก้โครงการ (multipart/form-data)
   * @param id project id
   * @param file ไฟล์ที่ต้องการอัปโหลด (File object)
   */
  upload: async (id: any, file: File) => {
    const formData = new FormData();
    formData.append("file", file); // ✅ ชื่อ field ควรตรงกับ backend เช่น "file"

    return api.post<any>(`/v1/project/${id}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
