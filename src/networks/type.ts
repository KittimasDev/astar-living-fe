export type paginate<T = any> = {
  is_active: any;
  entities: T[];
  page_information: pageInformation;
  id?: number;
};

export type pageInformation = {
  count: number;
  last_page: number;
  size: number;
  page: number;
  company_id?: number;
};

export type paginateForm = {
  page?: number;
  size?: number;
  company_id?: string;
};
export type SuccessForm = {
  success: boolean;
  message: string;
  Id?: number[];
};
