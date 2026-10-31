import { api } from "./api";

export const OptionsAPIs = {
  getHouseNumberByProject: async (id: any) => {
    return api.get<any>(`/v1/options/projects/${id}/residents/house_no`);
  },
};
