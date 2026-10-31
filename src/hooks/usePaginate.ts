import { notification } from "antd";
import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { pageInformation, paginate, paginateForm } from "../networks/type";

const usePaginate = <T>(apis: any, initialParams?: any) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<T[]>([]);
  const [rawData, setRawData] = useState<T[]>([]);
  const [pageInformation, setPageInformation] = useState<pageInformation>();

  const fetchData = async (page?: number, params?: any) => {
    setLoading(true);
    try {
      // คงแถวเดิมไว้ระหว่างโหลด (ลดกระพริบ, รู้สึกโหลดเร็วขึ้น)
      setTimeout(
        async () => {
          if (params?.noCache) {
            params.noCache = undefined;
          }
          if (params?.funcName) {
            params.funcName = undefined;
          }
          const response = initialParams?.funcName
            ? await apis[initialParams.funcName]({ page, ...params })
            : await apis.getAll({ page, ...params });
          setData(response.data.entities);
          setPageInformation(response.data.page_information);
        },
        params?.noCache ? 500 : 0
      );
    } catch (err: any) {
      notification.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    data,
    setData,
    pageInformation,
    fetchData,
  };
};
export default usePaginate;
